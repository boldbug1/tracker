import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

const THIRTY_DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 29 + i);
  const s1 = Math.sin(i * 2.7) * 0.5 + 0.5;
  const s2 = Math.sin(i * 1.3 + 1) * 0.5 + 0.5;
  return {
    date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
    completed: Math.round(s1 * 8 + 2),
    added: Math.round(s2 * 5 + 3),
    focusHours: Math.round((s1 * 3.5 + 1) * 10) / 10,
  };
});

const WEEK_DATA = [
  { day: "Mon", work: 4, focus: 2, personal: 1, health: 1 },
  { day: "Tue", work: 3, focus: 3, personal: 2, health: 0 },
  { day: "Wed", work: 5, focus: 1, personal: 0, health: 2 },
  { day: "Thu", work: 2, focus: 4, personal: 1, health: 1 },
  { day: "Fri", work: 4, focus: 2, personal: 3, health: 1 },
  { day: "Sat", work: 1, focus: 0, personal: 2, health: 2 },
  { day: "Sun", work: 1, focus: 1, personal: 3, health: 1 },
];

const TASK_DIST = [
  { name: "Work", value: 38, color: "#d4a853" },
  { name: "Deep Focus", value: 28, color: "#b48ee8" },
  { name: "Personal", value: 20, color: "#7eb8e8" },
  { name: "Health", value: 14, color: "#6fcf8a" },
];

const NOTE_DIST = [
  { name: "Work", value: 32, color: "#d4a853" },
  { name: "Personal", value: 24, color: "#7eb8e8" },
  { name: "Ideas", value: 28, color: "#b48ee8" },
  { name: "Journal", value: 16, color: "#6fcf8a" },
];

const PRIORITY_DIST = [
  { name: "High", value: 35, color: "#e07070" },
  { name: "Medium", value: 45, color: "#d4a853" },
  { name: "Low", value: 20, color: "rgba(240,237,232,0.3)" },
];

const GOALS = [
  { name: "Tasks", value: 68, fill: "#d4a853" },
  { name: "Focus", value: 82, fill: "#b48ee8" },
  { name: "Notes", value: 55, fill: "#6fcf8a" },
  { name: "Streak", value: 90, fill: "#7eb8e8" },
];

const TT = {
  contentStyle: {
    background: "#1a1a1a",
    border: "1px solid rgba(240,237,232,0.07)",
    borderRadius: "8px",
    fontSize: "11px",
    fontFamily: "JetBrains Mono, monospace",
    color: "#f0ede8",
  },
  labelStyle: { color: "rgba(240,237,232,0.4)", marginBottom: "4px" },
};

const TICK = {
  fontSize: 10,
  fill: "rgba(240,237,232,0.3)",
  fontFamily: "JetBrains Mono, monospace",
};

function Card({ title, children, className = "", delay = 0 }: { title: string; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`rounded-xl p-5 ${className}`}
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      <p className="font-mono-data text-xs tracking-widest uppercase mb-5" style={{ color: "var(--muted)" }}>{title}</p>
      {children}
    </motion.div>
  );
}

function DonutChart({ data }: { data: typeof TASK_DIST }) {
  return (
    <div>
      <div style={{ height: "160px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
              {data.map((d) => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
            </Pie>
            <Tooltip {...TT} formatter={(v) => [`${v}%`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-xs" style={{ color: "var(--foreground)" }}>{d.name}</span>
            </div>
            <span className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const { tasks, notes } = useApp();

  const totalCompleted = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const completionRate = total ? Math.round((totalCompleted / total) * 100) : 0;
  const avgFocus = Math.round(THIRTY_DAYS.reduce((s, d) => s + d.focusHours, 0) / 30 * 10) / 10;

  const statsRow = [
    { label: "Total Tasks", value: total.toString(), change: "+3 today", up: true },
    { label: "Completion Rate", value: `${completionRate}%`, change: "+5% vs last week", up: true },
    { label: "Notes Written", value: notes.length.toString(), change: "+1 today", up: true },
    { label: "Avg Focus / Day", value: `${avgFocus}h`, change: "−0.3h vs last week", up: false },
    { label: "Day Streak", value: "7", change: "Personal best", up: true },
    { label: "Tasks This Week", value: "43", change: "+12% vs last", up: true },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-8 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-8"
        >
          <p className="font-mono-data text-xs tracking-widest uppercase mb-1" style={{ color: "var(--muted)" }}>Data Overview</p>
          <h1 className="font-display text-4xl" style={{ color: "var(--foreground)" }}>Analytics</h1>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          {statsRow.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.28, ease: "easeOut" }}
              className="p-4 rounded-xl"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <p className="font-mono-data text-xs tracking-wide uppercase mb-2 leading-tight" style={{ color: "var(--muted)" }}>{s.label}</p>
              <p className="font-display text-2xl mb-1" style={{ color: "var(--foreground)" }}>{s.value}</p>
              <p className="font-mono-data text-xs" style={{ color: s.up ? "var(--green)" : "#e07070" }}>{s.change}</p>
            </motion.div>
          ))}
        </div>

        {/* 30-day area chart */}
        <Card title="30-Day Productivity — Tasks Completed" className="mb-5" delay={0.36}>
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={THIRTY_DAYS} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a853" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d4a853" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="addedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7eb8e8" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#7eb8e8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(240,237,232,0.04)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={TICK} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip {...TT} cursor={{ stroke: "rgba(240,237,232,0.08)" }} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#d4a853" strokeWidth={2} fill="url(#completedGrad)" dot={false} activeDot={{ r: 4, fill: "#d4a853", stroke: "#0c0c0c", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="added" name="Added" stroke="#7eb8e8" strokeWidth={1.5} fill="url(#addedGrad)" dot={false} activeDot={{ r: 3, fill: "#7eb8e8" }} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3">
            {[["Completed", "#d4a853"], ["Added", "#7eb8e8"]].map(([name, color]) => (
              <div key={name} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: color }} />
                <span className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>{name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Row: stacked bar + radial */}
        <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Card title="Tasks by Category — This Week" delay={0.42}>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEK_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={10}>
                  <CartesianGrid stroke="rgba(240,237,232,0.04)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} />
                  <Tooltip {...TT} cursor={{ fill: "rgba(240,237,232,0.03)" }} />
                  <Bar dataKey="work" name="Work" stackId="a" fill="#d4a853" />
                  <Bar dataKey="focus" name="Focus" stackId="a" fill="#b48ee8" />
                  <Bar dataKey="personal" name="Personal" stackId="a" fill="#7eb8e8" />
                  <Bar dataKey="health" name="Health" stackId="a" fill="#6fcf8a" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {[["Work", "#d4a853"], ["Focus", "#b48ee8"], ["Personal", "#7eb8e8"], ["Health", "#6fcf8a"]].map(([name, color]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>{name}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Weekly Goals Progress" delay={0.46}>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={GOALS} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "rgba(240,237,232,0.04)" }} />
                  <Tooltip {...TT} formatter={(v) => [`${v}%`, "Progress"]} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              {GOALS.map((g) => (
                <div key={g.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: g.fill }} />
                  <span className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>{g.name}</span>
                  <span className="font-mono-data text-xs" style={{ color: "var(--foreground)" }}>{g.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Three pie charts */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          <Card title="Task Distribution" delay={0.5}>
            <DonutChart data={TASK_DIST} />
          </Card>
          <Card title="Priority Breakdown" delay={0.54}>
            <DonutChart data={PRIORITY_DIST} />
          </Card>
          <Card title="Notes by Category" delay={0.58}>
            <DonutChart data={NOTE_DIST} />
          </Card>
        </div>

        {/* Focus time */}
        <Card title="Daily Focus Time (Hours) — 30 Days" className="mb-5" delay={0.62}>
          <div style={{ height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={THIRTY_DAYS} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="rgba(240,237,232,0.04)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tick={TICK} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={TICK} axisLine={false} tickLine={false} domain={[0, 6]} />
                <Tooltip {...TT} cursor={{ stroke: "rgba(240,237,232,0.08)" }} formatter={(v) => [`${v}h`, "Focus"]} />
                <Line type="monotone" dataKey="focusHours" stroke="#b48ee8" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#b48ee8", stroke: "#0c0c0c", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3">
            {[{ label: "Average", value: `${avgFocus}h`, color: "#b48ee8" }, { label: "Best day", value: "4.5h", color: "var(--green)" }, { label: "This week", value: "28.4h", color: "var(--accent)" }].map((s) => (
              <div key={s.label}>
                <p className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
                <p className="font-display text-lg" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity heatmap */}
        <Card title="Activity Heatmap — Last 12 Weeks" delay={0.66}>
          <div className="overflow-x-auto">
            <div className="flex gap-1" style={{ minWidth: "fit-content" }}>
              {Array.from({ length: 12 }, (_, week) => (
                <div key={week} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, day) => {
                    const seed = Math.sin((week * 7 + day) * 1.7 + 2) * 0.5 + 0.5;
                    const lvl = seed > 0.7 ? 4 : seed > 0.5 ? 3 : seed > 0.3 ? 2 : seed > 0.1 ? 1 : 0;
                    const ops = [0.05, 0.2, 0.4, 0.65, 1];
                    return (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.66 + (week * 7 + day) * 0.003, duration: 0.15 }}
                        className="w-3.5 h-3.5 rounded-sm"
                        title={`Week ${week + 1}: ${lvl * 2} tasks`}
                        style={{ background: lvl === 0 ? "rgba(240,237,232,0.05)" : `rgba(212,168,83,${ops[lvl]})` }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>Less</span>
            {[0.05, 0.2, 0.4, 0.65, 1].map((o) => (
              <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(212,168,83,${o})` }} />
            ))}
            <span className="font-mono-data text-xs" style={{ color: "var(--muted)" }}>More</span>
          </div>
        </Card>

      </div>
    </div>
  );
}
