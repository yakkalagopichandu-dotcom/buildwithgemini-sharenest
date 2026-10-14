import React from 'react';

interface A2UIProps {
  data: any;
  onClaim?: (donationId: string) => void;
}

export const A2UIRenderer: React.FC<A2UIProps> = ({ data, onClaim }) => {
  if (!data) return null;

  // Render Card Component
  const renderCard = (card: any) => {
    return (
      <div className="bg-white border-2 border-teal-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 my-2">
        {card.Column && renderColumn(card.Column)}
        {card.Row && renderRow(card.Row)}
      </div>
    );
  };

  const renderColumn = (column: any) => {
    return (
      <div className="flex flex-col gap-2">
        {column.children?.map((child: any, idx: number) => (
          <React.Fragment key={idx}>{renderComponent(child)}</React.Fragment>
        ))}
      </div>
    );
  };

  const renderRow = (row: any) => {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {row.children?.map((child: any, idx: number) => (
          <React.Fragment key={idx}>{renderComponent(child)}</React.Fragment>
        ))}
      </div>
    );
  };

  const renderText = (textObj: any) => {
    let text = textObj.text || '';
    if (typeof text === 'object' && text !== null) {
      text = text.literalString || text.text || JSON.stringify(text);
    }
    const hint = textObj.usageHint;

    if (hint === 'h1') {
      return <h1 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-1">{text}</h1>;
    }
    if (hint === 'h2' || hint === 'h3') {
      return <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">{text}</h3>;
    }
    if (hint === 'caption') {
      return <p className="text-[10px] text-slate-500 font-medium">{text}</p>;
    }
    return <p className="text-xs text-slate-700 leading-relaxed font-normal">{text}</p>;
  };

  const renderImage = (imgObj: any) => {
    const url = imgObj.url?.literalString || imgObj.url || '';
    return (
      <div className="rounded-xl overflow-hidden my-2 border border-slate-200">
        <img src={url} alt="A2UI Visual" className="w-full h-40 object-cover" />
      </div>
    );
  };

  const renderComponent = (comp: any) => {
    if (comp.Card) return renderCard(comp.Card);
    if (comp.Column) return renderColumn(comp.Column);
    if (comp.Row) return renderRow(comp.Row);
    if (comp.Text) return renderText(comp.Text);
    if (comp.Image) return renderImage(comp.Image);
    return null;
  };

  return <div className="a2ui-surface w-full">{renderComponent(data)}</div>;
};
