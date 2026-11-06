export interface FaqItem {
  q: string;
  a: string;
}

// Every answer is shown: no accordion, so nothing is hidden behind a click.
export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <div key={item.q} className="py-5">
          <dt className="text-pretty text-base font-medium text-fg sm:text-[17px]">
            {item.q}
          </dt>
          <dd className="mt-2 text-pretty text-sm leading-relaxed text-fg-subtle">
            {item.a}
          </dd>
        </div>
      ))}
    </dl>
  );
}
