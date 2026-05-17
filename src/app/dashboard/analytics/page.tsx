"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TrendingUp, Clock, Hash } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import { getAgentMetrics } from '@/api/agent';

const MOCK_DATA = {
  kpi: {
    totalLikes: 1842,
    totalComments: 376,
    reach: 12400,
    popularPosts: 8,
    likesChange: +12.5,
    commentsChange: +8.3,
    reachChange: +22.1,
    popularChange: +2,
  },
  chartData: [
    { date: '04/16', likes: 42, comments: 8 },
    { date: '04/18', likes: 55, comments: 12 },
    { date: '04/20', likes: 38, comments: 6 },
    { date: '04/22', likes: 67, comments: 15 },
    { date: '04/24', likes: 72, comments: 18 },
    { date: '04/26', likes: 48, comments: 9 },
    { date: '04/28', likes: 85, comments: 22 },
    { date: '04/30', likes: 63, comments: 14 },
    { date: '05/02', likes: 91, comments: 25 },
    { date: '05/04', likes: 78, comments: 19 },
    { date: '05/06', likes: 95, comments: 28 },
    { date: '05/08', likes: 88, comments: 21 },
    { date: '05/10', likes: 102, comments: 31 },
    { date: '05/12', likes: 96, comments: 27 },
    { date: '05/14', likes: 110, comments: 34 },
  ],
  popularPosts: [
    { id: 'post-1', thumbnail: '/demo/pass_01.jpg', likes: 110, comments: 34, badge: 'BEST' },
    { id: 'post-2', thumbnail: '/demo/pass_02.jpg', likes: 102, comments: 31, badge: 'BEST' },
    { id: 'post-3', thumbnail: '/demo/pass_03.jpg', likes: 96, comments: 27, badge: '인기 상승' },
  ],
  insights: [
    { icon: 'TrendingUp', key: 'insight1' },
    { icon: 'Clock', key: 'insight2' },
    { icon: 'Hash', key: 'insight3' },
  ],
};

function KpiCard({ label, value, change, goodText, growingText }: { label: string; value: string; change: number; goodText: string; growingText: string }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-6 flex flex-col gap-2">
      <span className="text-[0.85rem] text-[#5a2a2a]" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}>
        {label}
      </span>
      <span className="text-[2.5rem] font-bold text-[#1a1a1a] leading-tight" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
        {value}
      </span>
      <span
        className={`text-[0.8rem] px-2.5 py-1 rounded-full w-fit ${isPositive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}
      >
        {isPositive ? goodText : growingText}
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [metricsData, setMetricsData] = useState<{ total_posts: number; avg_caption_score: number; avg_retry_count: number; retry_rate: string; model_distribution: { mini: number; full: number } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const storedShopId = localStorage.getItem('shop_id');
    if (storedShopId) {
      setShopId(storedShopId);
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!shopId) return;
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const data = await getAgentMetrics(shopId);
        if (data && data.total_posts !== undefined) {
          setMetricsData(data);
        }
      } catch {}
      setLoading(false);
    };
    fetchMetrics();
  }, [shopId]);

  if (!isMounted) return null;

  const m = metricsData;
  const kpiTotalPosts = m ? m.total_posts : MOCK_DATA.kpi.totalLikes;
  const kpiQualityScore = m ? (m.avg_caption_score * 100).toFixed(1) : MOCK_DATA.kpi.totalComments.toString();
  const kpiRetryRate = m ? m.retry_rate : `${MOCK_DATA.kpi.reach}`;
  const kpiModel = m ? (m.model_distribution.mini > m.model_distribution.full ? 'MINI' : 'FULL') : `${MOCK_DATA.kpi.popularPosts}`;
  const kpiChange = m ? m.avg_caption_score : 0.85;
  const { chartData, popularPosts, insights } = MOCK_DATA;

  const iconMap = {
    TrendingUp: <TrendingUp size={18} className="text-white/80" />,
    Clock: <Clock size={18} className="text-white/80" />,
    Hash: <Hash size={18} className="text-white/80" />,
  };

  return (
    <div className="flex flex-row h-screen w-full bg-[#F5F0EB] overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-10 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* 타이틀 */}
        <h1
          className="text-[1.8rem] text-[#1a1a1a] mb-8 tracking-wide"
          style={{ fontFamily: "'S-Core Dream', sans-serif", fontWeight: 300 }}
        >
          {t.analytics_page.title}
        </h1>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && (<>
        {/* ① KPI 카드 */}
        <div className="grid grid-cols-4 gap-5 mb-10">
          <KpiCard label={t.analytics_page.totalLikes} value={String(kpiTotalPosts)} change={kpiChange >= 0.8 ? 1 : -1} goodText={t.analytics_page.good} growingText={t.analytics_page.growing} />
          <KpiCard label={t.analytics_page.totalComments} value={kpiQualityScore} change={kpiChange >= 0.8 ? 1 : -1} goodText={t.analytics_page.good} growingText={t.analytics_page.growing} />
          <KpiCard label={t.analytics_page.reach} value={kpiRetryRate} change={kpiChange >= 0.8 ? 1 : -1} goodText={t.analytics_page.good} growingText={t.analytics_page.growing} />
          <KpiCard label={t.analytics_page.popularPosts} value={kpiModel} change={kpiChange >= 0.8 ? 1 : -1} goodText={t.analytics_page.good} growingText={t.analytics_page.growing} />
        </div>

        {/* ② 성과 추이 그래프 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-8 mb-10">
          <h2
            className="text-[1.1rem] text-[#1a1a1a] mb-6"
            style={{ fontFamily: "'S-Core Dream', sans-serif", fontWeight: 300 }}
          >
            {t.analytics_page.chartTitle}
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e8" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#999' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #f0e8e8', fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
              <Line type="monotone" dataKey="likes" name={t.analytics_page.likes} stroke="#8B0000" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="comments" name={t.analytics_page.comments} stroke="rgba(196,118,118,0.5)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ③ 인기 게시물 */}
        <div className="mb-10">
          <h2
            className="text-[1.1rem] text-[#1a1a1a] mb-5"
            style={{ fontFamily: "'S-Core Dream', sans-serif", fontWeight: 300 }}
          >
            {t.analytics_page.popularTitle}
          </h2>
          <div className="flex gap-5 overflow-x-auto pb-2">
            {popularPosts.map((post) => (
              <div
                key={post.id}
                className="min-w-[220px] bg-white border border-[#f0e8e8] rounded-[16px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/post/${post.id}?shop_id=${shopId}`)}
              >
                <div className="relative aspect-square">
                  <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                  <span
                    className={`absolute top-3 left-3 text-[0.7rem] font-bold px-2.5 py-1 rounded-full text-white ${post.badge === 'BEST' ? 'bg-[#8B0000]' : 'bg-[#e67e22]'}`}
                  >
                    {post.badge}
                  </span>
                </div>
                <div className="p-4 flex items-center gap-4 text-[0.85rem] text-[#5a2a2a]" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ④ AI 인사이트 카드 */}
        <div className="bg-[#8B0000] rounded-[16px] p-8">
          <h2
            className="text-[1.2rem] text-white mb-6 flex items-center gap-2"
            style={{ fontFamily: "'S-Core Dream', sans-serif", fontWeight: 300 }}
          >
            {t.analytics_page.insightTitle}
          </h2>
          <div className="space-y-4 mb-8">
            {insights.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {iconMap[item.icon as keyof typeof iconMap]}
                <span className="text-white text-[0.95rem]" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 300 }}>
                  {t.analytics_page[item.key as keyof typeof t.analytics_page]}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/20 pt-6 flex items-center justify-between">
            <p className="text-white/70 text-[0.85rem]" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 300 }}>
              {t.analytics_page.insightCta}
            </p>
            <button
              onClick={() => router.push('/dashboard/ai-upload')}
              className="bg-white text-[#8B0000] text-[0.9rem] font-medium px-6 py-3 rounded-[10px] hover:bg-white/90 transition-colors cursor-pointer"
              style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}
            >
              {t.analytics_page.insightBtn}
            </button>
          </div>
        </div>
        </>)}
      </div>
    </div>
  );
}
