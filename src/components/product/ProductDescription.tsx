interface ProductDescriptionProps {
  description: string;
  className?: string;
}

export function ProductDescription({ description, className = '' }: ProductDescriptionProps) {
  // Simple markdown-like parser for product descriptions
  const parseDescription = (text: string) => {
    return text
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Line breaks
      .replace(/\n/g, '<br />')
      // Bullet points at start of line with leading spaces/tabs preserved
      .replace(/^(\s*)[\*\-]\s+(.*)$/gm, '$1• $2');
  };

  return (
    <div 
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parseDescription(description) }}
    />
  );
}
