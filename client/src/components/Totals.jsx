import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { NUTRIENTS, round } from '../nutrients'

// Daily totals as numbers, plus a chart of each nutrient as a % of its target.
export default function Totals({ totals }) {
  const data = NUTRIENTS.map((n) => ({
    ...n,
    amount: round(totals[n.key] ?? 0),
    percent: Math.round(((totals[n.key] ?? 0) / n.target) * 100),
  }))

  return (
    <section className="card">
      <h2>Daily totals</h2>
      <div className="tiles">
        {data.map((n) => (
          <div className="tile" key={n.key}>
            <span className="muted">{n.label}</span>
            <strong>{n.amount} <small>{n.unit}</small></strong>
            <span className="muted">{n.percent}% of {n.isLimit ? 'limit' : 'target'}</span>
          </div>
        ))}
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e6e9e4" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis unit="%" tickLine={false} axisLine={false} domain={[0, (max) => Math.max(100, Math.ceil(max / 25) * 25)]} />
            <Tooltip formatter={(value, _name, item) => [`${item.payload.amount} ${item.payload.unit} (${value}%)`, item.payload.label]} />
            <ReferenceLine y={100} stroke="#6b7568" strokeDasharray="4 4" label={{ value: 'target', position: 'insideTopRight', fill: '#6b7568', fontSize: 12 }} />
            <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
              {data.map((n) => (
                // Going over a limit (sodium) is the only "bad" over-100% case.
                <Cell key={n.key} fill={n.isLimit && n.percent > 100 ? '#c2410c' : '#2563eb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
