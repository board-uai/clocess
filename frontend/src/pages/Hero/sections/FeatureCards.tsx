const CARDS = [
  { tag: 'Your Server', icon: '/svg/server.svg', text: 'Files stay on your own Server safely' },
  { tag: 'Accessible', icon: '/svg/phone.svg', text: 'Reach them from any browser or your Phone' },
  { tag: 'Share Files', icon: '/svg/file.svg', text: 'Share files and pictures with your friends' },
  { tag: 'Open Source', icon: '/svg/free.svg', text: 'No need of payment or subscription' },
]

const CARD =
  'flex min-h-[13rem] flex-col justify-center gap-3 rounded-2xl border border-line bg-raise p-8 ' +
  'transition-transform duration-700 ease-out hover:duration-200 motion-safe:hover:scale-[1.15]'

export function FeatureCards() {
  return (
    <section className="relative z-10 px-pad pb-[clamp(80px,12vh,130px)]">
      <div className="mx-auto grid max-w-page grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ tag, icon, text }) => (
          <div key={tag} className={CARD}>
            <p className="text-[20px] text-ink-3 text-center">{tag}</p>

            <img src={icon} aria-hidden="true" className="mx-auto h-13 w-13" />
            <p className="text-[15px] text-ink-5 text-center">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
