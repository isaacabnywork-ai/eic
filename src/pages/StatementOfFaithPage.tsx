import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  BookOpen, 
  ArrowRight, 
  Mail, 
  ExternalLink 
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { PageHeader } from '@/components/ui/Section';

interface AffirmationItem {
  id: string;
  number: number;
  title: string;
  category: string;
  content: string;
}

const AFFIRMATIONS: AffirmationItem[] = [
  {
    id: 'transcendence-immanence',
    number: 1,
    title: 'Transcendence and Immanence',
    category: 'Theology Proper & Christology',
    content:
      'We hold on to the transcendence of the creator God as we understand in the scriptures but we also embrace the immanence of God as seen in the incarnation of Jesus Christ. The God of the Bible is not so far away that he is not knowable. We can know God truly because he has revealed himself in and through his son Jesus Christ. Even though God became man in Christ Jesus and he was fully human like us, he never sinned like us. The distance between the creation and the creator has been closed in, in the incarnation but the distinction between the creation and the divine creator yet remains. We affirm Jesus’ humanity and divinity at the same time.',
  },
  {
    id: 'only-one-incarnation',
    number: 2,
    title: 'Only One Incarnation',
    category: 'Incarnation & Sufficiency',
    content:
      'When talking about the incarnation, we believe that God became man once for all in the whole history of mankind in the person of Jesus Christ. There are no multiple entries of God in this world to sort out human issues. It is done, once for all. The perfect and sufficient work of Jesus excludes the need for God to have to fix any potential problems among mankind.',
  },
  {
    id: 'uniqueness-of-christ',
    number: 3,
    title: 'The Uniqueness of Christ',
    category: 'Exclusivity of the Gospel',
    content:
      'We affirm that there is only one way, there is only one truth and there is only one life – The Lord Jesus Christ.',
  },
  {
    id: 'salvation-not-by-works',
    number: 4,
    title: 'Salvation Not by Works',
    category: 'Soteriology & Grace',
    content:
      'We believe that salvation is a gift of God that we receive by grace through faith in Jesus Christ. Therefore we reject any efforts by works of religion or good deeds for salvation.',
  },
  {
    id: 'equality-of-human-beings',
    number: 5,
    title: 'Equality of All Human Beings',
    category: 'Imago Dei & Contextual Denunciation',
    content:
      'We affirm that God created all human beings in the image of God regardless of caste, colour and creed. We vehemently denounce any divisions in the church on the basis of caste, tribe, region, language or community.',
  },
  {
    id: 'one-life-death-judgement',
    number: 6,
    title: 'One Life, One Death, One Judgement',
    category: 'Eschatology & Denial of Reincarnation',
    content:
      'We affirm the teachings of scriptures that God has ordained for man to die once and be judged after that. Therefore we reject any teaching that espouses reincarnation. There is no room for rebirth in Christian theology.',
  },
  {
    id: 'sinfulness-of-humanity',
    number: 7,
    title: 'Sinfulness of Humanity',
    category: 'Anthropology & Total Depravity',
    content:
      'We deny any teaching that attempts to downplay the doctrine of the total depravity of mankind. We understand that none is righteous, no one who seeks God and everyone has turned away from God. It is not only, not wrong to talk about the sin of mankind but it is necessary to talk about the sinfulness of humanity.',
  },
  {
    id: 'false-prosperity',
    number: 8,
    title: 'False Prosperity',
    category: 'Rejection of Prosperity Gospel',
    content:
      'We vehemently reject every shade of prosperity gospel (health, wealth and prosperity). We reject Word of faith movement, positive thinking movement and denounce blanket promises of physical healing to anyone following Christ. God is kind and can and often blesses his children with physical and material blessings – health and success. But this is not guaranteed and nor are we promised these things in the New Covenant. On the contrary following Jesus can cost us our health, wealth, success and sometimes even life only to gain eternal life that can never be lost.',
  },
  {
    id: 'sufficiency-of-scriptures',
    number: 9,
    title: 'Sufficiency of Scriptures',
    category: 'Bibliology & Revelation',
    content:
      'We affirm the sufficiency of scriptures which means that we deny fresh authoritative and binding revelations found outside scriptures. We deny any visions that add anything to the scriptures that we already have. Any teaching that undermines scripture must be rejected.',
  },
  {
    id: 'offices-in-local-church',
    number: 10,
    title: 'Offices in the Local Church',
    category: 'Ecclesiology & Church Leadership',
    content:
      'We believe that the Prophets and Apostles laid the foundation of the church and it is misleading and unhelpful for church leaders to lay claim to such titles for themselves. The main offices in the New Testament today are one of elders (pastor/elder/presbyter/bishop – all these words denote the same office) that are in the leadership and another of the deacons (servants) that are to serve the church in practical ways.',
  },
  {
    id: 'priesthood-of-all-believers',
    number: 11,
    title: 'Priesthood of All Believers',
    category: 'Ecclesiology & Pastoral Calling',
    content:
      'While we affirm that elders/pastors are a gift to the church from God but we also renounce any unhealthy distinction between clergy and laity. Elders/pastors are not mediators between God and man but simply teachers of the Word, and the undershepherd of the flock.',
  },
  {
    id: 'gender-roles',
    number: 12,
    title: 'Gender Roles',
    category: 'Biblical Manhood & Womanhood',
    content:
      'We believe that God created man in his image, he created them as Male and Female. We embrace the complementarian position on gender roles and reject egalitarianism and renounce male chauvinism. We believe that the Bible teaches that men should lead in love and humility at homes and at church.',
  },
  {
    id: 'non-biblical-missiology',
    number: 13,
    title: 'Non-Biblical Missiology',
    category: 'Missiology & Biblical Evangelism',
    content:
      'We denounce any underhanded means to lure people to follow Christ. While thoughtful contextualization in line with scripture is welcome, we outrightly reject any form of insider movements that are deceptive in nature and do not trust in the sovereignty of God in the work of salvation.',
  },
];

export function StatementOfFaithPage() {
  return (
    <>
      <SeoHead
        title="What We Believe - Statement of Faith"
        description="The doctrinal foundations, confessional statement, affirmations, and denials of Equip Indian Churches for the Indian context."
        path="/statement-of-faith"
      />

      <PageHeader
        eyebrow="Foundational Doctrine"
        title="What We Believe"
        description="The confessional commitments, theological convictions, and contextual affirmations and denials that define Equip Indian Churches."
      />

      <div className="container-page py-12 sm:py-16 lg:py-20 max-w-5xl space-y-16">
        {/* TGC Confessional Anchor */}
        <section className="rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8 lg:p-10 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 text-accent-text font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Evangelical & Reformed Foundation</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Confessional Statement
          </h2>

          <p className="text-base sm:text-lg text-body leading-relaxed">
            EIC subscribes to the confessional statement of The Gospel Coalition found here:{' '}
            <a
              href="https://www.thegospelcoalition.org/about/foundation-documents/#confessional-statement"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-accent-text hover:underline inline-flex items-center gap-1"
            >
              <span>The Gospel Coalition’s Confessional Statement</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </p>

          <p className="text-sm sm:text-base text-muted leading-relaxed border-t border-accent/20 pt-4">
            Along with the above-mentioned statement, we at EIC want to make certain affirmations and denials keeping in mind the Indian context specifically.
          </p>
        </section>

        {/* 13 Affirmations & Denials List */}
        <section className="space-y-6">
          <div className="border-b border-line pb-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Affirmations & Denials in the Indian Context
            </h3>
            <p className="mt-1 text-sm text-muted">
              Thirteen clear biblical boundaries addressing challenges and false teachings in our subcontinent.
            </p>
          </div>

          <div className="space-y-6">
            {AFFIRMATIONS.map((item) => (
              <article
                key={item.id}
                id={item.id}
                className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-xs hover:border-accent/40 transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent-text font-bold text-xs">
                      {item.number}
                    </span>
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                      {item.title}
                    </h4>
                  </div>
                  <span className="rounded-full border border-line bg-surface-2 px-3 py-0.5 text-[11px] font-semibold text-muted">
                    {item.category}
                  </span>
                </div>

                <p className="text-base text-body leading-relaxed pl-0 sm:pl-10">
                  {item.content}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Navigation Banner */}
        <section className="rounded-2xl border border-line bg-surface-2 p-8 sm:p-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-bold text-ink">
              Have Questions or Want to Connect?
            </h3>
            <p className="text-sm text-body max-w-xl">
              We welcome dialogue with pastors, elders, church leaders, and believers contending for the faith across India.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink hover:border-accent hover:text-accent-text shadow-xs transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>About EIC</span>
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-ink hover:brightness-105 shadow-xs transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact & Inquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
