type Props = {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: string;
  };
  
  export default function StatsCard({
    title,
    value,
    subtitle,
    icon,
    color,
  }: Props) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:scale-[1.02] hover:border-violet-500">
  
        <div className="flex items-center justify-between">
  
          <div>
  
            <p className="text-sm uppercase tracking-wider text-gray-400">
              {title}
            </p>
  
            <h2 className={`mt-4 text-5xl font-black ${color}`}>
              {value}
            </h2>
  
            <p className="mt-3 text-gray-400">
              {subtitle}
            </p>
  
          </div>
  
          <div className="text-5xl">
            {icon}
          </div>
  
        </div>
  
      </div>
    );
  }