import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowLeft, ArrowRight, Lightbulb, Wrench, BarChart3, Quote,
  Users, Clock, Globe, Tag
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await db.portfolioProject.findFirst({
    where: { slug, isPublished: true },
  });
  if (!project) return {};
  return {
    title: `${project.title} — KVL TECH Portfolio`,
    description: project.description.slice(0, 160),
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;

  const project = await db.portfolioProject.findFirst({
    where: { slug, isPublished: true },
  });

  if (!project) notFound();

  let metrics: Record<string, string> = {};
  try {
    if (project.metrics) metrics = JSON.parse(project.metrics);
  } catch {}

  const metricEntries = Object.entries(metrics);

  return (
    <>
      <Navbar />
      <main className="pt-[104px] bg-[var(--color-bg)]">

        {/* Hero */}
        <section className="relative h-[480px] sm:h-[560px] overflow-hidden">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-6"
              >
                <ArrowLeft size={16} /> Back to Portfolio
              </Link>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-[var(--color-gold)] text-white text-xs font-bold">
                  {project.industry}
                </span>
                {project.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-5xl text-white mb-3 leading-tight">
                {project.title}
              </h1>
              <p className="text-white/70 text-lg">{project.clientName}</p>
            </div>
          </div>
        </section>

        {/* Meta row */}
        <section className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap gap-6">
            {project.duration && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Clock size={16} className="text-[var(--color-gold)]" />
                <span className="font-semibold text-[var(--color-text)]">{project.duration}</span>
                <span>duration</span>
              </div>
            )}
            {project.teamSize && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Users size={16} className="text-[var(--color-gold)]" />
                <span className="font-semibold text-[var(--color-text)]">{project.teamSize}</span>
                <span>team</span>
              </div>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--color-gold)] hover:underline"
              >
                <Globe size={16} /> View Live Site
              </a>
            )}
          </div>
        </section>

        {/* Main content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">

            {/* Description */}
            <div>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">{project.description}</p>
            </div>

            {/* Challenge */}
            {project.challenge && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Lightbulb size={20} className="text-red-500" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-[var(--color-text)]">The Challenge</h2>
                </div>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{project.challenge}</p>
              </div>
            )}

            {/* Solution */}
            {project.solution && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Wrench size={20} className="text-blue-500" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Our Solution</h2>
                </div>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{project.solution}</p>
              </div>
            )}

            {/* Results */}
            {project.results && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <BarChart3 size={20} className="text-green-500" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Results</h2>
                </div>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{project.results}</p>
              </div>
            )}

            {/* Metrics cards */}
            {metricEntries.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-5">Key Metrics</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {metricEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="card p-5 text-center border border-[var(--color-border)]"
                    >
                      <p className="font-display font-bold text-3xl text-[var(--color-gold)] mb-1">{value}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {project.gallery.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-5">Project Gallery</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.gallery.map((img, i) => (
                    <div key={i} className="relative h-48 rounded-xl overflow-hidden border border-[var(--color-border)]">
                      <Image
                        src={img}
                        alt={`${project.title} gallery ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="50vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tech Stack */}
            {project.techStack.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={16} className="text-[var(--color-gold)]" />
                  <h3 className="font-display font-semibold text-[var(--color-text)]">Tech Stack</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonial */}
            {project.testimonial && (
              <div className="card p-6 bg-[var(--color-navy)]">
                <Quote size={24} className="text-[var(--color-gold)] mb-3" />
                <p className="text-white/80 text-sm leading-relaxed italic mb-4">
                  &ldquo;{project.testimonial}&rdquo;
                </p>
                {project.authorName && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-white font-bold text-sm">
                      {project.authorName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{project.authorName}</p>
                      <p className="text-xs text-white/50">{project.clientName}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="card p-6 border border-[var(--color-gold)]/30">
              <h3 className="font-display font-bold text-lg text-[var(--color-text)] mb-2">
                Want a similar solution?
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                Let&apos;s build something amazing for your business too.
              </p>
              <div className="space-y-3">
                <Link href="/contact" className="btn-gold w-full justify-center flex items-center gap-2">
                  Get a Free Quote <ArrowRight size={15} />
                </Link>
                <a
                  href="https://wa.me/919942000413?text=Hi! I saw your portfolio and want a similar project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#25D366]/40 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/10 transition-all"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
