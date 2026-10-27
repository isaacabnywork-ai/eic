import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  ArrowRight, 
  Mail 
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';

export function AboutPage() {
  return (
    <>
      <SeoHead
        title="About Us - What is EIC?"
        description="Equip Indian Churches is a ministry where pastors partner together to help provide direction and momentum to biblical gospel growth across India."
        path="/about"
      />

      <PageHeader
        eyebrow="Our Movement & Vision"
        title="What is EIC?"
        description="A fellowship of pastors and local churches partnering together to foster biblical gospel growth and unity across India."
      />

      <div className="container-page py-12 sm:py-16 lg:py-20 max-w-5xl space-y-16 sm:space-y-20">
        {/* Core Introduction */}
        <section className="rounded-2xl border border-line bg-surface p-6 sm:p-10 shadow-xs space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-accent-text">
            <span>Ministry Purpose</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
            Equipping Churches. Fostering Truth. Contending for the Faith.
          </h2>

          <p className="text-base sm:text-lg text-body leading-relaxed">
            Equip Indian Churches is a ministry where several pastors have partnered together with a desire to help provide a direction and momentum to the Biblical gospel growth. We hope to do this by creating a resource centre for Christians and churches. We also hope to see unity based on the truth among various streams of evangelical Christianity in the reformed tradition.
          </p>
        </section>

        {/* Foundation Scriptures */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-1.5">
              Biblical Foundation
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              The Scriptures That Undergird This Fellowship
            </h3>
            <p className="mt-2 text-sm sm:text-base text-muted">
              The following two verses undergird this fellowship of Christians and churches:
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Verse 1 */}
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-accent/40 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent-text font-serif font-bold text-lg sm:text-xl">
                  <Heart className="w-5 h-5 shrink-0 text-accent-text" />
                  <span>Psalm 133:1</span>
                </div>
                <blockquote className="font-serif text-lg sm:text-xl italic text-ink leading-relaxed">
                  “Behold, how good and pleasant it is when brothers dwell in unity”
                </blockquote>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60 text-xs font-semibold uppercase tracking-wider text-muted">
                Unity Based on the Truth
              </div>
            </div>

            {/* Verse 2 */}
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 flex flex-col justify-between shadow-xs relative overflow-hidden group hover:border-accent/40 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent-text font-serif font-bold text-lg sm:text-xl">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-accent-text" />
                  <span>Jude 3</span>
                </div>
                <blockquote className="font-serif text-lg sm:text-xl italic text-ink leading-relaxed">
                  “Beloved… appealing to you to contend for the faith that was once for all delivered to the saints.”
                </blockquote>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60 text-xs font-semibold uppercase tracking-wider text-muted">
                Contending for Sound Doctrine
              </div>
            </div>
          </div>
        </section>

        {/* Current Situation of the Indian Church */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-1.5">
              Context & Assessment
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              The Current Situation of the Indian Church
            </h3>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-lg">
                  ✓
                </span>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-ink text-base sm:text-lg">Gospel Hunger & Church Growth</h4>
                  <p className="text-body text-sm sm:text-base leading-relaxed">
                    On one hand the Lord has been kind to give much gospel growth, churches are being planted, faithful preachers of the gospel are being raised and there is a clear hunger and thirst for faithful teaching across the land.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold text-lg">
                  !
                </span>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-ink text-base sm:text-lg">Disunity Among Like-Minded Brethren</h4>
                  <p className="text-body text-sm sm:text-base leading-relaxed">
                    But that is often undercut by disunity among theologically like-minded brothers, division over minor issues and unwillingness to partner together for the cause of the gospel.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 font-bold text-lg">
                  ✕
                </span>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-ink text-base sm:text-lg">Shallow Theology & False Teachings</h4>
                  <p className="text-body text-sm sm:text-base leading-relaxed">
                    This situation is further exacerbated by the fact that a section of the church is plagued by insufficient Biblical teaching, shallow man-centred theology. Sadly, false teachings and even cults continue to expand their influence on the church.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What does EIC hope to do? */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-1.5">
              Strategic Mission
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              What Does EIC Hope to Do?
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Urge Biblical Faithfulness',
                desc: 'To urge the Christians and the church to be Biblically faithful in all areas of doctrine, worship, and practice.',
              },
              {
                title: 'Foster True Gospel Unity',
                desc: 'To foster unity among Christians and churches for the sake of the gospel across regions and languages.',
              },
              {
                title: 'Provide Sound Resources',
                desc: 'To provide sound resources in order to foster Biblical teaching and true unity rooted in Christ.',
              },
              {
                title: 'Prepare Faithful Servants',
                desc: 'To help prepare pastors and members of the church so that they can serve faithfully in their local assemblies.',
              },
              {
                title: 'Equip Theological Students',
                desc: 'To equip pastors and seminary students to face new challenges in current theological studies and culture.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-line bg-surface p-6 shadow-xs flex items-start gap-3.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-text font-bold text-xs mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-ink text-base">{item.title}</h4>
                  <p className="text-sm text-body leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How does EIC hope to undertake such a task? */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-text mb-1.5">
              Implementation Strategy
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              How Does EIC Hope to Undertake Such a Task?
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Heart,
                title: 'Prayer & Intercession',
                text: 'By encouraging Christians and churches to pray for this need and for a revival of sound doctrine in India.',
              },
              {
                icon: Users,
                title: 'Facilitating Gospel Partnerships',
                text: 'By facilitating partnership between Christians and churches for the gospel without compromising on truth.',
              },
              {
                icon: ShieldCheck,
                title: 'Common Biblical Platform',
                text: 'By helping various Christians and churches to come together on a common platform for mutual encouragement and assembly.',
              },
              {
                icon: BookOpen,
                title: 'Indigenous Resources by Indians for Indians',
                text: 'By encouraging creation of resources by Indians for Indians in order to be culturally sensitive, linguistically rich, and relevant.',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-line bg-surface p-6 sm:p-7 shadow-xs flex items-start gap-4 hover:border-accent/40 transition-colors"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-text">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-ink text-base">{pillar.title}</h4>
                    <p className="text-sm text-body leading-relaxed">{pillar.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Navigation / Next Steps Banner */}
        <section className="rounded-2xl border border-line bg-surface-2 p-8 sm:p-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-bold text-ink">
              Discover What We Confess & Believe
            </h3>
            <p className="text-sm text-body max-w-xl">
              Learn more about our doctrinal foundation, affirmations, and denials tailored for the Indian context.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/statement-of-faith"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-ink hover:brightness-105 shadow-xs transition cursor-pointer"
            >
              <span>Statement of Faith</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink hover:border-accent hover:text-accent-text shadow-xs transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
