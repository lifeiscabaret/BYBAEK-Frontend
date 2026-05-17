"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { X, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import type { Post } from '@/types';

type PostCardData = Post;

export default function PostsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
    const fetchPosts = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await apiClient.get(`/agent/posts/${shopId}`);
        const raw = response.data.posts || [];
        const enriched: PostCardData[] = raw.map((p: Post) => ({ ...p }));
        setPosts(enriched);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [shopId]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-row h-screen w-full bg-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-10 flex flex-col min-w-0 h-full overflow-y-auto">
        <h1
          className="text-[1.6rem] text-[#1A1A1A] mb-8"
          style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 700 }}
        >
          {t.posts_page.title}
        </h1>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="flex-1 flex items-center justify-center text-red-500 text-[0.95rem]">
            게시물을 불러오지 못했습니다
          </div>
        )}

        {/* 3열 그리드 */}
        {!loading && !error && <div className="grid grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-[16px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
              onClick={() => setSelectedPost(post)}
            >
              {/* 이미지 4:3 */}
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                <img src={post.thumbnail_url || post.photo_urls?.[0] || '/demo/pass_01.jpg'} alt="" className="w-full h-full object-cover" />
              </div>

              {/* 캡션 + 해시태그 */}
              <div className="p-4">
                {post.caption && (
                  <p
                    className="text-[14px] text-[#1A1A1A] leading-snug mb-2 line-clamp-2"
                    style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}
                  >
                    {post.caption}
                  </p>
                )}
                {post.hashtags && post.hashtags.length > 0 && (
                  <p className="text-[12px] text-[#8B0000] truncate" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                    {post.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
                  </p>
                )}

                {/* 상태 뱃지 */}
                <div className="flex items-center mt-3">
                  {post.status === 'success' && (
                    <span className="text-[11px] font-bold text-white bg-[#8B0000] px-2.5 py-0.5 rounded-full">UPLOADED</span>
                  )}
                  {post.status === 'draft' && (
                    <span className="text-[11px] font-bold text-gray-600 bg-gray-200 px-2.5 py-0.5 rounded-full">DRAFT</span>
                  )}
                  {post.status === 'fail' && (
                    <span className="text-[11px] font-bold text-white bg-red-500 px-2.5 py-0.5 rounded-full">FAILED</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>}

        {!loading && !error && posts.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[0.95rem]">
            {t.posts_page.empty}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-[20px] w-[860px] max-h-[90vh] overflow-hidden flex"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 좌측: 이미지 */}
            <div className="w-[440px] shrink-0 bg-gray-100">
              {(selectedPost.thumbnail_url || selectedPost.photo_urls?.[0]) ? (
                <img
                  src={selectedPost.thumbnail_url || selectedPost.photo_urls![0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>

            {/* 우측: 정보 */}
            <div className="flex-1 p-8 flex flex-col overflow-y-auto relative">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={22} />
              </button>

              {/* 캡션 */}
              <p
                className="text-[15px] text-[#1A1A1A] leading-relaxed mb-4 pr-8"
                style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}
              >
                {selectedPost.caption || '캡션 없음'}
              </p>

              {/* 해시태그 */}
              {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                <p className="text-[13px] text-[#8B0000] mb-6 leading-relaxed" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                  {selectedPost.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}
                </p>
              )}

              {/* 상태 */}
              <div className="flex items-center gap-4 mb-8">
                {selectedPost.status === 'success' && <span className="text-[12px] font-bold text-white bg-[#8B0000] px-3 py-1 rounded-full">UPLOADED</span>}
                {selectedPost.status === 'draft' && <span className="text-[12px] font-bold text-gray-600 bg-gray-200 px-3 py-1 rounded-full">DRAFT</span>}
                {selectedPost.status === 'fail' && <span className="text-[12px] font-bold text-white bg-red-500 px-3 py-1 rounded-full">FAILED</span>}
              </div>

              {/* 버튼들 */}
              <div className="mt-auto flex flex-col gap-3">
                <button
                  onClick={() => router.push(`/post/${selectedPost.id}?shop_id=${shopId}`)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] bg-[#8B0000] text-white text-[0.9rem] font-medium hover:bg-[#6b0000] transition-colors cursor-pointer"
                  style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}
                >
                  <Pencil size={16} /> {t.posts_page.edit}
                </button>
                <button
                  onClick={() => router.push('/preview')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] border border-[#8B0000] text-[#8B0000] text-[0.9rem] font-medium hover:bg-[#fdf0f0] transition-colors cursor-pointer"
                  style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}
                >
                  <RefreshCw size={16} /> {t.posts_page.regenerate}
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] border border-gray-200 text-gray-500 text-[0.9rem] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}
                >
                  <Trash2 size={16} /> {t.posts_page.delete_btn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
