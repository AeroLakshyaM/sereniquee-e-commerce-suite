import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface SeoFieldsProps {
  value: {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
  };
  onChange: (value: SeoFieldsProps['value']) => void;
  defaultTitle?: string;
  defaultDescription?: string;
}

export function SeoFields({ value, onChange, defaultTitle, defaultDescription }: SeoFieldsProps) {
  const handleChange =
    (field: keyof SeoFieldsProps['value']) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [field]: e.target.value });

  const titleLength = value.seoTitle?.length || 0;
  const descLength = value.seoDescription?.length || 0;

  return (
    <div className="mt-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          SEO OPTIMIZATION
        </h3>
        <Badge variant="secondary" className="text-xs">
          Boost Traffic
        </Badge>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs space-y-1">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">Why SEO matters:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Helps customers find your products on Google</li>
              <li>Improves search rankings and visibility</li>
              <li>Increases website traffic and sales</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="seoTitle">SEO Title</Label>
          <span className={`text-xs ${titleLength > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {titleLength}/60 characters
          </span>
        </div>
        <Input
          id="seoTitle"
          value={value.seoTitle}
          onChange={handleChange('seoTitle')}
          placeholder={defaultTitle || 'e.g. Hand-Poured Lavender Soy Candle | Sereniquee'}
          maxLength={70}
        />
        <p className="text-xs text-muted-foreground">
          {value.seoTitle ? '✅ Custom SEO title set' : `💡 Leave empty to use: "${defaultTitle || 'page title'}"`}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="seoDescription">Meta Description</Label>
          <span className={`text-xs ${descLength < 120 || descLength > 160 ? 'text-amber-500' : 'text-green-600'}`}>
            {descLength}/160 characters
          </span>
        </div>
        <Textarea
          id="seoDescription"
          value={value.seoDescription}
          onChange={handleChange('seoDescription')}
          placeholder={defaultDescription || 'Short, compelling summary that appears in Google search results (120-160 characters)'}
          rows={3}
          maxLength={170}
        />
        <p className="text-xs text-muted-foreground">
          {value.seoDescription ? (
            descLength >= 120 && descLength <= 160 ? (
              <span className="text-green-600">✅ Perfect length for Google!</span>
            ) : (
              <span className="text-amber-600">⚠️ Aim for 120-160 characters for best results</span>
            )
          ) : (
            `💡 Leave empty to use: "${defaultDescription || 'default description'}"`
          )}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="seoKeywords">SEO Keywords</Label>
        <Input
          id="seoKeywords"
          value={value.seoKeywords}
          onChange={handleChange('seoKeywords')}
          placeholder="lavender candle, soy wax, aromatherapy, home decor, luxury candles"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated keywords that describe this content. Helps Google understand what this page is about.
        </p>
      </div>
    </div>
  );
}
