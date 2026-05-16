"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { X, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import apiClient from '@/api/index';
import type { Post } from '@/types';

interface PostCardData extends Post {
  likes?: number;
  comments?: number;
  badge?: 'BEST' | 'GOOD';
}

export default function PostsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostCardData | null>(null);

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
      try {
        const response = await apiClient.get(`/agent/posts/${shopId}`);
        const raw = response.data.posts || [];
        const enriched: PostCardData[] = raw.map((p: Post, i: number) => ({
          ...p,
          likes: Math.floor(Math.random() * 200) + 20,
          comments: Math.floor(Math.random() * 40) + 3,
          badge: i < 2 ? 'BEST' as const : 'GOOD' as const,
        }));
        setPosts(enriched);
      } catch (error) {
        console.error('게시물 로딩 실패:', error);
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
          게시물
        </h1>

        {/* 3열 그리드 */}
        <div className="grid grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-[16px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
              onClick={() => setSelectedPost(post)}
            >
              {/* 이미지 4:3 */}
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                {post.thumbnail_url ? (
                  <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : post.photo_urls?.[0] ? (
                  <img src={post.photo_urls[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                )}
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

                {/* 지표 + 뱃지 */}
                <div className="flex items-center gap-3 mt-3 text-[13px] text-[#1A1A1A]" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                  <span>♥️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  {post.badge === 'BEST' && (
                    <span className="ml-auto text-[11px] font-bold text-white bg-[#8B0000] px-2.5 py-0.5 rounded-full">BEST</span>
                  )}
                  {post.badge === 'GOOD' && (
                    <span className="ml-auto text-[11px] font-bold text-[#8B0000] bg-[#e8d5d5] px-2.5 py-0.5 rounded-full">GOOD</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[0.95rem]">
            아직 게시물이 없습니다
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

              {/* 지표 */}
              <div className="flex items-center gap-4 mb-8 text-[14px] text-[#1A1A1A]" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                <span>♥️ {selectedPost.likes}</span>
                <span>💬 {selectedPost.comments}</span>
                {selectedPost.badge && (
                  <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${selectedPost.badge === 'BEST' ? 'text-white bg-[#8B0000]' : 'text-[#8B0000] bg-[#e8d5d5]'}`}>
                    {selectedPost.badge}
                  </span>
                )}
              </div>

              {/* 버튼들 */}
              <div className="mt-auto flex flex-col gap-3">
                <button
                  onClick={() => router.push(`/post/${selectedPost.id}?shop_id=${shopId}`)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] bg-[#8B0000] text-white text-[0.9rem] font-medium hover:bg-[#6b0000] transition-colors cursor-pointer"
                  style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}
                >
                  <Pencil size={16} /> 수정
                </button>
                <button
                  onClick={() => router.push('/preview')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] border border-[#8B0000] text-[#8B0000] text-[0.9rem] font-medium hover:bg-[#fdf0f0] transition-colors cursor-pointer"
                  style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}
                >
                  <RefreshCw size={16} /> 다시 생성
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] border border-gray-200 text-gray-500 text-[0.9rem] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}
                >
                  <Trash2 size={16} /> 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
