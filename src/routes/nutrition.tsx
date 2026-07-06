import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Flame,
  Droplet,
  FileSpreadsheet,
  FileText,
  Utensils,
  TrendingUp,
  Award,
  Plus,
} from "lucide-react";
import {
  getConsumption,
  getWater,
  addWaterGlass,
  sumRange,
  DAILY_CAL_GOAL,
  type ConsumptionEntry,
} from "@/lib/nutrition";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition Dashboard — Bites" },
      {
        name: "description",
        content:
          "Track daily, weekly and monthly calories, macros, water intake and export your report.",
      },
    ],
  }),
  component: NutritionPage,
});

const DAY = 86400_000;

function NutritionPage() {
  const [entries, setEntries] = useState<ConsumptionEntry[]>([]);
  const [water, setWater] = useState<{ date: string; glasses: number }[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setEntries(getConsumption());
    setWater(getWater());
  }, [tick]);

  const now = Date.now();
  const day = sumRange(entries, now - DAY);
  const week = sumRange(entries, now - 7 * DAY);
  const month = sumRange(entries, now - 30 * DAY);
  const avgDaily = Math.round(month.calories / 30);

  const dailyChart = useMemo(() => {
    const days: { day: string; kcal: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = now - i * DAY;
      const s = sumRange(entries, start - DAY / 2).calories -
        sumRange(entries, start + DAY / 2).calories;
      const label = new Date(start).toLocaleDateString("en-IN", {
        weekday: "short",
      });
      days.push({ day: label, kcal: Math.max(0, Math.round(s)) });
    }
    // simpler: bucket by date string
    const map = new Map<string, number>();
    entries.forEach((e) => {
      if (e.loggedAt < now - 7 * DAY) return;
      const k = new Date(e.loggedAt).toLocaleDateString("en-IN", {
        weekday: "short",
      });
      map.set(k, (map.get(k) ?? 0) + e.calories);
    });
    return days.map((d) => ({ day: d.day, kcal: Math.round(map.get(d.day) ?? 0) }));
  }, [entries, now]);

  const macroData = [
    { name: "Protein", value: Math.round(week.protein), color: "hsl(var(--primary))" },
    { name: "Carbs", value: Math.round(week.carbs), color: "hsl(var(--warning, 38 92% 50%))" },
    { name: "Fat", value: Math.round(week.fat), color: "hsl(var(--destructive))" },
  ];

  const dishCount = new Map<string, number>();
  const restCount = new Map<string, number>();
  entries.forEach((e) => {
    dishCount.set(e.name, (dishCount.get(e.name) ?? 0) + e.quantity);
    restCount.set(e.restaurantName, (restCount.get(e.restaurantName) ?? 0) + e.quantity);
  });
  const topDish = [...dishCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const topRest = [...restCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const goalPct = Math.min(100, Math.round((day.calories / DAILY_CAL_GOAL) * 100));
  const remaining = Math.max(0, DAILY_CAL_GOAL - Math.round(day.calories));
  const healthScore = Math.max(
    0,
    Math.min(100, Math.round(100 - Math.abs(avgDaily - DAILY_CAL_GOAL) / 20)),
  );

  const today = new Date().toISOString().slice(0, 10);
  const glasses = water.find((w) => w.date === today)?.glasses ?? 0;

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const summary = [
      ["Bites — Nutrition Report"],
      ["Generated", new Date().toLocaleString("en-IN")],
      [],
      ["Metric", "Today", "Week", "Month"],
      ["Calories (kcal)", Math.round(day.calories), Math.round(week.calories), Math.round(month.calories)],
      ["Protein (g)", Math.round(day.protein), Math.round(week.protein), Math.round(month.protein)],
      ["Carbs (g)", Math.round(day.carbs), Math.round(week.carbs), Math.round(month.carbs)],
      ["Fat (g)", Math.round(day.fat), Math.round(week.fat), Math.round(month.fat)],
      ["Sugar (g)", Math.round(day.sugar), Math.round(week.sugar), Math.round(month.sugar)],
      [],
      ["Average daily intake", avgDaily, "kcal"],
      ["Health score", healthScore, "/ 100"],
      ["Most ordered dish", topDish],
      ["Favourite restaurant", topRest],
    ];
    const ws = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    const history = [
      ["Date", "Dish", "Restaurant", "Qty", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)"],
      ...entries.map((e) => [
        new Date(e.loggedAt).toLocaleString("en-IN"),
        e.name,
        e.restaurantName,
        e.quantity,
        Math.round(e.calories),
        Math.round(e.protein),
        Math.round(e.carbs),
        Math.round(e.fat),
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(history), "History");
    XLSX.writeFile(wb, `bites-nutrition-${today}.xlsx`);
  };

  const exportWord = async () => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = await import("docx");
    const { saveAs } = await import("file-saver");
    const cell = (t: string, bold = false) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t, bold })] })],
        width: { size: 2400, type: WidthType.DXA },
      });
    const summaryRows = [
      ["Metric", "Today", "Week", "Month"],
      ["Calories (kcal)", `${Math.round(day.calories)}`, `${Math.round(week.calories)}`, `${Math.round(month.calories)}`],
      ["Protein (g)", `${Math.round(day.protein)}`, `${Math.round(week.protein)}`, `${Math.round(month.protein)}`],
      ["Carbs (g)", `${Math.round(day.carbs)}`, `${Math.round(week.carbs)}`, `${Math.round(month.carbs)}`],
      ["Fat (g)", `${Math.round(day.fat)}`, `${Math.round(week.fat)}`, `${Math.round(month.fat)}`],
    ].map((r, i) =>
      new TableRow({ children: r.map((c) => cell(c, i === 0)) }),
    );

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              children: [new TextRun("Bites — Nutrition Report")],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `Generated ${new Date().toLocaleString("en-IN")}`,
                  italics: true,
                  color: "666666",
                }),
              ],
            }),
            new Paragraph({ children: [new TextRun("")] }),
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun("Summary")],
            }),
            new Table({ rows: summaryRows, width: { size: 9600, type: WidthType.DXA } }),
            new Paragraph({ children: [new TextRun("")] }),
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun("Highlights")],
            }),
            new Paragraph({ children: [new TextRun(`• Average daily intake: ${avgDaily} kcal`)] }),
            new Paragraph({ children: [new TextRun(`• Health score: ${healthScore}/100`)] }),
            new Paragraph({ children: [new TextRun(`• Most ordered dish: ${topDish}`)] }),
            new Paragraph({ children: [new TextRun(`• Favourite restaurant: ${topRest}`)] }),
            new Paragraph({ children: [new TextRun("")] }),
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun("AI Health Summary")],
            }),
            new Paragraph({
              children: [
                new TextRun(
                  avgDaily > DAILY_CAL_GOAL
                    ? `Your average daily intake (${avgDaily} kcal) is above the ${DAILY_CAL_GOAL} kcal target. Consider lighter options like salads and grilled proteins on a few days each week.`
                    : avgDaily === 0
                      ? "Start logging orders to see personalized diet suggestions."
                      : `You're averaging ${avgDaily} kcal/day, comfortably around the ${DAILY_CAL_GOAL} kcal target. Keep the variety and prioritize protein.`,
                ),
              ],
            }),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `bites-nutrition-${today}.docx`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <TrendingUp className="h-3.5 w-3.5" /> Health tracker
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Nutrition dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your calorie & macro intake, powered by your Bites order history.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-semibold hover:border-primary"
          >
            <FileSpreadsheet className="h-4 w-4 text-success" /> Excel
          </button>
          <button
            onClick={exportWord}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-semibold hover:border-primary"
          >
            <FileText className="h-4 w-4 text-primary" /> Word
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Flame className="h-4 w-4" />}
          label="Calories today"
          value={`${Math.round(day.calories)} kcal`}
          sub={`${remaining} kcal remaining · ${goalPct}% of goal`}
        />
        <KpiCard
          icon={<Utensils className="h-4 w-4" />}
          label="Calories this month"
          value={`${Math.round(month.calories)} kcal`}
          sub={`Avg ${avgDaily} kcal / day`}
        />
        <KpiCard
          icon={<Award className="h-4 w-4" />}
          label="Health score"
          value={`${healthScore}/100`}
          sub={topDish !== "—" ? `Most ordered: ${topDish}` : "Start logging to score"}
        />
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Droplet className="h-4 w-4 text-primary" /> Water intake
            </span>
            <button
              onClick={() => {
                addWaterGlass();
                setTick((t) => t + 1);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
            >
              <Plus className="h-3 w-3" /> Glass
            </button>
          </div>
          <div className="mt-2 font-display text-2xl font-bold">
            {glasses} <span className="text-sm font-medium text-muted-foreground">/ 8</span>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-8 flex-1 rounded ${i < glasses ? "bg-primary" : "bg-secondary"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Calories last 7 days</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChart}>
                <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="kcal" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <h2 className="text-sm font-semibold">Macro split (this week)</h2>
          <div className="mt-3 h-64">
            {week.protein + week.carbs + week.fat > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macroData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                    {macroData.map((m) => (
                      <Cell key={m.name} fill={m.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                No data yet — place an order to see your macros.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meal history */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Meal history</h2>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            You haven't logged any meals yet.{" "}
            <Link to="/restaurants" className="text-primary hover:underline">
              Order something
            </Link>{" "}
            to start tracking.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60">
            {entries.slice(0, 20).map((e, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.restaurantName} · {new Date(e.loggedAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{Math.round(e.calories)} kcal</div>
                  <div className="text-xs text-muted-foreground">×{e.quantity}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
