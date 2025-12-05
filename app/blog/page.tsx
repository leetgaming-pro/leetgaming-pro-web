'use client';

/**
 * Intelligent News/Blog Page
 * Features: Categories, featured posts, recent posts, search integration
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter, Image, Button, Chip, Input, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { PageContainer } from '@/components/layouts/centered-content';
import { logger } from '@/lib/logger';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  featured: boolean;
  image: string;
  slug: string;
}

// API response types
interface APIBlogPost {
  id?: string;
  post_id?: string;
  title?: string;
  excerpt?: string;
  summary?: string;
  content?: string;
  author?: { name?: string; avatar?: string };
  author_name?: string;
  author_avatar?: string;
  author_id?: string;
  category?: string;
  tags?: string[];
  published_at?: string;
  created_at?: string;
  read_time?: number;
  featured?: boolean;
  image_url?: string;
  cover_image?: string;
  slug?: string;
}

interface APIBlogResponse {
  data?: APIBlogPost[];
  posts?: APIBlogPost[];
}

// Map API response to BlogPost
const mapAPIToBlogPost = (p: APIBlogPost): BlogPost => ({
  id: p.id || p.post_id || '',
  title: p.title || 'Untitled',
  excerpt: p.excerpt || p.summary || '',
  content: p.content || '',
  author: {
    name: p.author?.name || p.author_name || 'Unknown',
    avatar: p.author?.avatar || p.author_avatar || '/avatars/default-author.svg',
  },
  category: p.category || 'General',
  tags: p.tags || [],
  publishedAt: p.published_at || p.created_at || new Date().toISOString(),
  readTime: p.read_time || Math.ceil((p.content?.length || 0) / 1000) || 5,
  featured: p.featured || false,
  image: p.image_url || p.cover_image || '/images/blog-placeholder.svg',
  slug: p.slug || p.id || '',
});

const categories = ['All', 'Product Updates', 'Interviews', 'Community', 'Guides', 'Engineering'];

const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  'Product Updates': 'primary',
  'Interviews': 'secondary',
  'Community': 'success',
  'Guides': 'warning',
  'Engineering': 'danger',
};

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = process.env.NEXT_PUBLIC_REPLAY_API_URL || 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/v1/blog/posts`);

        if (response.ok) {
          const data: APIBlogResponse = await response.json();
          const apiPosts = data.data || data.posts || [];
          const mappedPosts: BlogPost[] = apiPosts.map(mapAPIToBlogPost);
          setPosts(mappedPosts);
        } else {
          // Show empty state when API fails
          setPosts([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load blog posts';
        logger.error('Failed to fetch blog posts', err);
        setError(errorMessage);
        // Show empty state on error - no mock data fallback
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const featuredPosts = posts.filter((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured);

  const filteredPosts = regularPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <PageContainer
        title="News & Insights"
        description="Loading blog posts..."
        maxWidth="7xl"
      >
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Loading blog posts..." color="primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="News & Insights"
      description="Latest updates, guides, and stories from the LeetGaming.PRO community"
      maxWidth="7xl"
    >
      {/* Error State */}
      {error && (
        <Card className="mb-6">
          <CardBody className="text-center py-8">
            <Icon icon="solar:danger-triangle-bold" width={48} className="mx-auto mb-4 text-warning" />
            <p className="text-warning font-semibold mb-2">Error loading posts</p>
            <p className="text-default-500">{error}</p>
          </CardBody>
        </Card>
      )}

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Icon icon="solar:star-bold" className="text-warning" width={28} />
            Featured Stories
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredPosts.map((post) => (
              <Card
                key={post.id}
                isPressable
                className="hover:scale-[1.02] transition-transform"
                onPress={() => router.push(`/blog/${post.slug}`)}
              >
                <CardHeader className="absolute z-10 top-4 flex-col items-start bg-black/60 backdrop-blur-sm m-2 rounded-large">
                  <Chip size="sm" color={categoryColors[post.category] || 'default'} variant="flat">
                    {post.category}
                  </Chip>
                  <h3 className="text-white/90 font-bold text-xl mt-2">{post.title}</h3>
                </CardHeader>
                <Image
                  removeWrapper
                  alt={post.title}
                  className="z-0 w-full h-full object-cover"
                  src={post.image}
                  height={400}
                />
                <CardFooter className="absolute bg-black/60 bottom-0 z-10 border-t-1 border-default-600">
                  <div className="flex flex-col w-full gap-2">
                    <p className="text-tiny text-white/80">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image
                          alt={post.author.name}
                          className="rounded-full"
                          height={24}
                          width={24}
                          src={post.author.avatar}
                        />
                        <span className="text-tiny text-white/60">{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-tiny text-white/60">
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <Icon icon="solar:clock-circle-linear" width={14} />
                          {post.readTime} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-8 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category}
              size="lg"
              variant={selectedCategory === category ? 'solid' : 'bordered'}
              color={selectedCategory === category ? 'primary' : 'default'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Chip>
          ))}
        </div>
        <Input
          className="max-w-xs"
          placeholder="Search posts..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<Icon icon="solar:magnifer-linear" width={20} />}
          isClearable
          onClear={() => setSearchQuery('')}
        />
      </div>

      {/* Recent Posts Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="solar:ghost-linear" width={64} className="mx-auto mb-4 text-default-400" />
            <p className="text-default-600">No posts found matching your criteria</p>
            <Button
              className="mt-4"
              variant="light"
              color="primary"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                isPressable
                className="hover:scale-[1.02] transition-transform"
                onPress={() => router.push(`/blog/${post.slug}`)}
              >
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <Chip size="sm" color={categoryColors[post.category] || 'default'} variant="flat" className="mb-2">
                    {post.category}
                  </Chip>
                  <h4 className="font-bold text-lg line-clamp-2">{post.title}</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-2 px-4">
                  <Image
                    alt={post.title}
                    className="object-cover rounded-xl"
                    src={post.image}
                    width="100%"
                    height={180}
                  />
                  <p className="text-tiny text-default-600 mt-3 line-clamp-3">{post.excerpt}</p>
                </CardBody>
                <CardFooter className="text-small px-4 pt-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Image
                        alt={post.author.name}
                        className="rounded-full"
                        height={20}
                        width={20}
                        src={post.author.avatar}
                      />
                      <span className="text-tiny text-default-500">{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-tiny text-default-400">
                      <Icon icon="solar:clock-circle-linear" width={14} />
                      {post.readTime} min
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter Subscription */}
      <Card className="mt-12 bg-gradient-to-r from-primary-500 to-secondary-500">
        <CardBody className="py-8 px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Stay Updated</h3>
              <p className="text-white/80">
                Get the latest news, guides, and updates delivered directly to your inbox.
              </p>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <Input
                className="min-w-[280px]"
                placeholder="Enter your email"
                type="email"
                variant="bordered"
                classNames={{
                  input: 'text-white',
                  inputWrapper: 'border-white/40 hover:border-white/60',
                }}
              />
              <Button color="default" variant="solid" className="bg-white text-primary font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </PageContainer>
  );
}
