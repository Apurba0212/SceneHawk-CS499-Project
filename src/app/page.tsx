import Link from "next/link";
import Faq, { type FaqItem } from "@/components/Faq";
import SearchBox from "@/components/SearchBox";
import { Card, Em, buttonClass, pillClass } from "@/components/ui";
import { getFilmRepository } from "@/lib/data";
import { PIPELINE_LABELS, PIPELINE_MODES, type PipelineMode } from "@/lib/types";

export const dynamic = "force-dynamic";

const STARTERS = [
  "Isolated and unsettling, slow burn, no jump scares",
  "Melancholic and visually beautiful",
  "Meditative sci-fi with long takes",
];

// Defines the three discovery steps
const STEPS = [
  {
    n: "01",
    title: "You describe a mood",
    body: "Atmosphere, pacing and visual style, in your own words. For example: isolated and unsettling, slow burn, no jump scares.",
  },
  {
    n: "02",
    title: "Agents search the analysis",
    body: "Separate agents look for evidence in themes, mood, narrative structure and cinematography.",
  },
  {
    n: "03",
    title: "You get ranked matches",
    body: "Each film comes with a reason, taken from the analysis it was found in.",
  },
];

const SYSTEM_BLURBS: Record<PipelineMode, string> = {
  content: "Genre, director, and keyword overlap — the conventional baseline.",
  llm: "The query goes straight to a language model — no retrieval at all.",
  rag: "One retrieval pass over the whole analytical corpus, then rank and explain.",
  multi: "Specialized agents retrieve per dimension; a ranker fuses their evidence.",
};

const DIMENSIONS = [
  "Themes",
  "Atmosphere",
  "Narrative",
  "Visual language",
  "Inner lives",
];

// Stores questions and answers
const FAQS: FaqItem[] = [
  {
    q: "What is SceneHawk?",
    a: "A film discovery system that searches by experience — atmosphere, pacing, and visual language — instead of genre labels or ratings. Under the hood, it's a multi-agent pipeline running over a curated analytical film corpus.",
  },
  {
    q: "Do I need an account?",
    a: "No. SceneHawk only searches a public film corpus — there's nothing personal to store or protect, so there's no sign-in.",
  },
  {
    q: "How is this different from IMDb or Netflix?",
    a: "IMDb indexes metadata; Netflix ranks by watch history and genre. SceneHawk retrieves how films actually feel — the dread, the pacing, the cinematography — and explains why each match fits your request.",
  },
  {
    q: "Where does the film analysis come from?",
    a: "A curated knowledge base of structured analytical profiles: themes, atmosphere, narrative structure, visual style, and technique for each film. The corpus is deliberately small but deep — this is a research prototype, not a catalog of everything.",
  },
  {
    q: "What does a match score actually mean?",
    a: "It's a retrieval score — how strongly a film's analytical profile matches the criteria you described. It's not a quality rating and isn't scientifically validated; it's evidence weight, honestly labeled.",
  },
  {
    q: "Why recommend films I've never heard of?",
    a: "Conventional systems surface the same popular titles. SceneHawk's corpus deliberately includes cult and obscure films — matching on experience rather than popularity helps surface titles that genre filters bury.",
  },
];

// Renders the main homepage content
export default async function Home() {
  const films = await getFilmRepository().listFilms();

  const stats = [
    { value: String(films.length), label: "films, analyzed in depth" },
    { value: String(DIMENSIONS.length), label: "analytical dimensions each" },
    { value: String(PIPELINE_MODES.length), label: "systems compared side by side" },
  ];

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="pb-16 pt-16 md:pb-24 md:pt-28">
        <div className="max-w-3xl">
          <h1 className="text-balance font-display text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Film search by <Em>mood</Em>, not genre
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-fg-muted">
            Describe the atmosphere, pacing or visual style you want.
            SceneHawk searches {films.length} hand-analyzed films and tells
            you why each match fits.
          </p>
        </div>

        <div className="mt-10 max-w-2xl">
          <SearchBox />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-fg-faint">Try:</span>
            {STARTERS.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}&mode=multi`}
                className={pillClass()}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────── */}
      <section className="grid grid-cols-1 divide-y divide-line rounded-xl border border-line bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-5">
            <p className="font-display text-3xl text-fg">{s.value}</p>
            <p className="mt-1 text-sm text-fg-subtle">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ─── How it works ─────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-24 py-20 md:py-28">
        <h2 className="text-balance font-display text-3xl tracking-tight md:text-4xl">
          How the search works
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 bg-accent-soft font-display text-sm text-accent">
                {s.n}
              </span>
              <h3 className="mt-5 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-subtle">
                {s.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Research: the four systems ───────────────────── */}
      <section className="border-t border-line py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <h2 className="text-balance font-display text-3xl tracking-tight md:text-4xl">
              Four search systems, compared
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-fg-subtle">
              This is a research project. Every search can run through four
              systems over the same films, from a simple baseline to the full
              multi-agent pipeline. Switch between them on any results page.
            </p>
            <Link
              href="/search"
              className={`${buttonClass("secondary")} group mt-6`}
            >
              Compare the systems
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PIPELINE_MODES.map((m) => (
              <Card
                key={m}
                className={`p-5 ${m === "multi" ? "border-accent/40" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-fg">{PIPELINE_LABELS[m]}</p>
                  {m === "multi" && (
                    <span className="text-xs text-accent">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-fg-subtle">
                  {SYSTEM_BLURBS[m]}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section
        id="faq"
        className="scroll-mt-24 border-t border-line py-20 md:py-28"
      >
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <h2 className="text-balance font-display text-3xl tracking-tight md:text-4xl">
              Common questions
            </h2>
            <p className="mt-6 text-sm text-fg-subtle">
              Anything else can go to{" "}
              <Link href="/chat" className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
                Chat
              </Link>
              .
            </p>
          </div>
          <Faq items={FAQS} />
        </div>
      </section>
    </div>
  );
}
