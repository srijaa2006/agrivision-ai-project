import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CloudSun, MapPin, Loader2, Droplets, Wind, Thermometer, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/app/weather")({
  component: WeatherPage,
});

type Day = { date: string; tmax: number; tmin: number; precip: number; code: number; wind: number };
type Forecast = { place: string; current: { temp: number; humidity: number; wind: number; code: number }; days: Day[]; advice: string };

const CODE_TO_LABEL: Record<number, string> = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Showers", 81: "Heavy showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunder + hail", 99: "Severe thunder",
};
const CODE_EMOJI: Record<number, string> = {
  0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",
  51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",
  71:"🌨️",73:"🌨️",75:"❄️",80:"🌧️",81:"⛈️",82:"⛈️",95:"⛈️",96:"⛈️",99:"⛈️",
};

function farmerAdvice(days: Day[]): string {
  const totalRain = days.reduce((s, d) => s + d.precip, 0);
  const heavyRain = days.find(d => d.precip > 25);
  const drySpell = days.every(d => d.precip < 1);
  const hot = days.some(d => d.tmax > 38);
  const cold = days.some(d => d.tmin < 5);
  if (heavyRain) return `Heavy rain expected ${new Date(heavyRain.date).toLocaleDateString(undefined,{weekday:"short"})} — delay spraying & secure drainage channels.`;
  if (drySpell) return `Dry week ahead (${totalRain.toFixed(0)} mm total). Plan irrigation and mulch to retain soil moisture.`;
  if (hot) return `High heat coming — irrigate early morning or late evening. Watch for wilting in sensitive crops.`;
  if (cold) return `Cool nights ahead — protect young seedlings with cover.`;
  return `Mild conditions overall. Good window for routine field work and light spraying.`;
}

function WeatherPage() {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Forecast | null>(null);

  async function detect() {
    if (!("geolocation" in navigator)) { toast.error("Location not available"); return; }
    setLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 12000 })
      );
      const { latitude, longitude } = pos.coords;
      const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;
      const r = await fetch(wxUrl);
      if (!r.ok) throw new Error("Weather service unavailable");
      const j = await r.json();

      let place = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
      try {
        const g = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`);
        const gj = await g.json();
        const p = gj?.results?.[0];
        if (p) place = [p.name, p.admin1, p.country].filter(Boolean).join(", ");
      } catch {/* ignore */}

      const days: Day[] = j.daily.time.map((d: string, i: number) => ({
        date: d,
        tmax: j.daily.temperature_2m_max[i],
        tmin: j.daily.temperature_2m_min[i],
        precip: j.daily.precipitation_sum[i] ?? 0,
        code: j.daily.weather_code[i],
        wind: j.daily.wind_speed_10m_max[i],
      }));

      setData({
        place,
        current: {
          temp: j.current.temperature_2m,
          humidity: j.current.relative_humidity_2m,
          wind: j.current.wind_speed_10m,
          code: j.current.weather_code,
        },
        days,
        advice: farmerAdvice(days),
      });
    } catch (e: any) {
      toast.error(e.message ?? "Could not fetch weather");
    } finally { setLoading(false); }
  }

  useEffect(() => { detect(); /* try once on mount */ /* eslint-disable-next-line */ }, []);

  return (
    <div className="py-6 space-y-6 animate-pop">
      <div className="clay-lg p-7 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl grad-sun flex items-center justify-center clay-sm"><CloudSun className="w-6 h-6 text-accent-foreground" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold">{t("weather_title")}</h1>
            <p className="text-sm text-muted-foreground">{t("weather_sub")}</p>
          </div>
        </div>
        <button onClick={detect} disabled={loading}
          className="clay-sm smooth px-4 py-2.5 rounded-xl hover:scale-105 disabled:opacity-50 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          {loading ? t("detecting") : t("detect_location")}
        </button>
      </div>

      {!data && !loading && (
        <div className="clay p-8 text-center">
          <CloudSun className="w-14 h-14 mx-auto text-primary mb-3 float" />
          <p className="text-muted-foreground">{t("no_location")}</p>
        </div>
      )}

      {data && (
        <>
          <div className="clay-lg p-7 grid md:grid-cols-[1fr_auto] gap-4 items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{data.place}</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="font-display text-6xl font-black text-grad-leaf">{Math.round(data.current.temp)}°</p>
                <p className="text-2xl">{CODE_EMOJI[data.current.code] ?? "🌤️"}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{CODE_TO_LABEL[data.current.code] ?? "—"}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="inline-flex items-center gap-1.5"><Droplets className="w-4 h-4 text-primary" />{data.current.humidity}%</span>
                <span className="inline-flex items-center gap-1.5"><Wind className="w-4 h-4 text-primary" />{Math.round(data.current.wind)} km/h</span>
                <span className="inline-flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-primary" />feels real</span>
              </div>
            </div>
            <div className="clay-sm p-4 rounded-2xl max-w-sm bg-accent/30">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm">{data.advice}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {data.days.map((d, i) => (
              <div key={d.date} className="clay p-4 text-center smooth hover:-translate-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {i === 0 ? "Today" : new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}
                </p>
                <p className="text-3xl my-1">{CODE_EMOJI[d.code] ?? "🌤️"}</p>
                <p className="text-sm font-bold">{Math.round(d.tmax)}° <span className="text-muted-foreground font-normal">{Math.round(d.tmin)}°</span></p>
                <p className="text-[10px] text-primary mt-1 inline-flex items-center gap-1 justify-center"><Droplets className="w-3 h-3" />{d.precip.toFixed(1)}mm</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
