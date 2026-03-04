'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function BlogPostReader() {
    const params = useParams();
    const slug = params?.slug;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPost() {
            try {
                const res = await fetch(`/api/posts/${slug}`);
                const result = await res.json();

                if (result.success) {
                    setPost(result.data);
                }
            } catch (error) {
                console.error("Failed to load post");
            } finally {
                setLoading(false);
            }
        }
        if (slug) fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#0a1120] flex items-center justify-center">
                <Loader2 className="animate-spin text-gold" size={40} />
            </main>
        );
    }

    if (!post) {
        return (
            <main className="min-h-screen bg-[#0a1120] text-white flex flex-col items-center justify-center">
                <h1 className="text-2xl mb-4">Production log not found.</h1>
                <Link href="/journal" className="text-gold hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Return to Archives
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a1120] text-white flex flex-col selection:bg-gold selection:text-navy">
            <Navbar />

            {/* --- POST HEADER --- */}
            <header className="pt-40 pb-12 px-6 max-w-4xl mx-auto w-full text-center">
                <Link
                    href={`/journal`}
                    className="inline-flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-bold mb-8 hover:-translate-x-2 transition-transform"
                >
                    <ArrowLeft size={14} /> Back to Archives
                </Link>
                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-6 leading-tight text-white">
                    {post.title}
                </h1>
                {post.excerpt && (
                    <p className="text-slate/80 text-xl max-w-2xl mx-auto leading-relaxed">
                        {post.excerpt}
                    </p>
                )}
            </header>

            {/* --- OPTIONAL HERO BANNER --- */}
            {post.coverImage && (
                <div className="w-full max-w-6xl mx-auto px-6 mb-16">
                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                        <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
                    </div>
                </div>
            )}


            {/* --- THE BLOCK RENDERER --- */}
            <article className="grow pb-32 px-6 max-w-4xl mx-auto w-full flow-root text-lg text-slate-300 leading-relaxed">
                {post.sections?.map((section) => {

                    // 1. STANDARD TEXT BLOCK
                    if (section.type === 'text') {
                        return (
                            <div
                                key={section.id}
                                dangerouslySetInnerHTML={{ __html: section.content }}
                                className="mb-8 whitespace-pre-wrap"
                                style={{ clear: 'none' }} // Forces text to allow wrapping
                            />
                        );
                    }

                    // 2. CODE BLOCK
                    if (section.type === 'code') {
                        return (
                            <div key={section.id} className="relative my-10 group" style={{ clear: 'both' }}>
                                <div className="absolute top-0 right-0 bg-white/5 text-slate text-[10px] uppercase tracking-widest px-3 py-1 rounded-bl-lg font-bold">Code snippet</div>
                                <pre className="bg-[#050810] border border-white/10 p-6 pt-10 rounded-xl overflow-x-auto">
                                    <code className="text-emerald-400 font-mono text-sm leading-relaxed block">
                                        {section.content}
                                    </code>
                                </pre>
                            </div>
                        );
                    }

                    // 3. FULL WIDTH IMAGE
                    if (section.type === 'image-full') {
                        return (
                            <figure key={section.id} className="my-12" style={{ clear: 'both' }}>
                                <img src={section.imageUrl} alt="Production Media" className="w-full rounded-2xl shadow-lg border border-white/5" />
                                {section.caption && (
                                    <figcaption className="text-center text-sm text-slate mt-4 italic">{section.caption}</figcaption>
                                )}
                            </figure>
                        );
                    }

                    // 4. IMAGE LEFT (NUCLEAR INLINE CSS)
                    if (section.type === 'image-left') {
                        return (
                            <figure
                                key={section.id}
                                style={{
                                    float: 'left',
                                    width: '100%',
                                    maxWidth: '320px', // Locks the image to a beautiful sidebar size
                                    marginRight: '2rem', // Adds breathing room between image and text
                                    marginBottom: '1rem',
                                    marginTop: '0.5rem'
                                }}
                            >
                                <img src={section.imageUrl} alt="Production Media" className="w-full rounded-2xl shadow-lg border border-white/5" />
                                {section.caption && (
                                    <figcaption className="text-sm text-slate italic mt-3 text-center">{section.caption}</figcaption>
                                )}
                            </figure>
                        );
                    }

                    // 5. IMAGE RIGHT (NUCLEAR INLINE CSS)
                    if (section.type === 'image-right') {
                        return (
                            <figure
                                key={section.id}
                                style={{
                                    float: 'right',
                                    width: '100%',
                                    maxWidth: '320px', // Locks the image to a beautiful sidebar size
                                    marginLeft: '2rem', // Adds breathing room between image and text
                                    marginBottom: '1rem',
                                    marginTop: '0.5rem'
                                }}
                            >
                                <img src={section.imageUrl} alt="Production Media" className="w-full rounded-2xl shadow-lg border border-white/5" />
                                {section.caption && (
                                    <figcaption className="text-sm text-slate italic mt-3 text-center">{section.caption}</figcaption>
                                )}
                            </figure>
                        );
                    }

                    return null;
                })}
            </article>

            <Footer />
        </main>
    );
}