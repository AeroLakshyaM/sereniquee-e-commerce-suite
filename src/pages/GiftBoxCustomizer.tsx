import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SeoHelmet } from '@/components/layout/SeoHelmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import { StorageImage } from '@/components/ui/storage-image';
import {
  GIFT_BOX_TIERS,
  BOX_STYLES,
  GIFT_ACCESSORIES,
  GiftBoxTier,
  BoxStyle,
  GiftAccessory,
  GiftCardMessage,
} from '@/types/giftBox';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import {
  Gift,
  Sparkles,
  Check,
  Plus,
  X,
  Flame,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  PackageCheck,
  Scissors,
  Heart,
  MessageSquareHeart,
} from 'lucide-react';

export default function GiftBoxCustomizer() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();

  // Wizard Steps: 1: Box Format, 2: Candle Selection, 3: Accessories, 4: Calligraphy Card
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Configuration state
  const [selectedTier, setSelectedTier] = useState<GiftBoxTier>(GIFT_BOX_TIERS[1]); // Default Trio
  const [selectedBoxStyle, setSelectedBoxStyle] = useState<BoxStyle>(BOX_STYLES[0]); // Default Ivory Gold
  const [selectedCandles, setSelectedCandles] = useState<Product[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<GiftAccessory[]>([]);
  const [cardMessage, setCardMessage] = useState<GiftCardMessage>({
    to: '',
    from: '',
    note: '',
    cardDesign: 'ivory',
  });

  // Candle catalog filtering
  const [candleFilter, setCandleFilter] = useState('');
  const { data: productsData, isLoading: productsLoading } = useProducts(undefined, candleFilter);
  const availableCandles = useMemo(() => {
    const list = productsData?.pages.flatMap(p => p.products) || [];
    return list.filter(p => p.stock_quantity > 0 && p.category !== 'Gift Box');
  }, [productsData]);

  // Compute total price
  const accessoriesTotal = selectedAccessories.reduce((sum, acc) => sum + acc.price, 0);
  const totalPrice = selectedTier.basePrice + accessoriesTotal;

  // Candle slot management
  const handleAddCandle = (candle: Product) => {
    if (selectedCandles.length >= selectedTier.capacity) {
      toast({
        title: 'Tray is full',
        description: `Your ${selectedTier.title} holds ${selectedTier.capacity} candles. Remove one to replace it, or upgrade to a larger box.`,
      });
      return;
    }
    setSelectedCandles(prev => [...prev, candle]);
    toast({
      title: 'Candle added to box',
      description: `${candle.name} placed in slot ${selectedCandles.length + 1}`,
    });
  };

  const handleRemoveCandle = (index: number) => {
    setSelectedCandles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAccessory = (accessory: GiftAccessory) => {
    setSelectedAccessories(prev => {
      const exists = prev.some(a => a.id === accessory.id);
      if (exists) {
        return prev.filter(a => a.id !== accessory.id);
      }
      return [...prev, accessory];
    });
  };

  const handleCompleteBox = () => {
    if (selectedCandles.length < selectedTier.capacity) {
      toast({
        title: 'Please fill all candle slots',
        description: `Please choose ${selectedTier.capacity - selectedCandles.length} more candle${
          selectedTier.capacity - selectedCandles.length > 1 ? 's' : ''
        } for your ${selectedTier.title}.`,
        variant: 'destructive',
      });
      setActiveStep(2);
      return;
    }

    const candleNames = selectedCandles.map(c => c.name).join(', ');
    const accessoryNames = selectedAccessories.map(a => a.name).join(', ');

    const bespokeProduct: Product = {
      id: `bespoke-gift-box-${Date.now()}`,
      name: `Bespoke Hamper: ${selectedTier.title} (${selectedBoxStyle.name})`,
      slug: `bespoke-hamper-${Date.now()}`,
      price: totalPrice,
      description: `Artisanal Gift Hamper in ${selectedBoxStyle.name}. Selected Candles: ${candleNames}. Accessories: ${
        accessoryNames || 'Complimentary match vial'
      }.${cardMessage.note ? ` Gift Note: "${cardMessage.note}"` : ''}`,
      image_url: selectedCandles[0]?.image_url || '/landing-candles.jpg',
      category: 'Gift Box',
      stock_quantity: 999,
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      average_rating: 5,
      review_count: 1,
      full_description: null,
      image_urls: selectedCandles.map(c => c.image_url || '').filter(Boolean),
      seo_description: null,
      seo_keywords: null,
      seo_title: null,
      sku: `GIFT-${selectedTier.id.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      metadata: {
        is_gift_box: true,
        box_tier: selectedTier.id,
        box_style: selectedBoxStyle.name,
        ribbon: selectedBoxStyle.ribbonName,
        candles: selectedCandles.map(c => ({ id: c.id, name: c.name, price: c.price })),
        accessories: selectedAccessories.map(a => ({ id: a.id, name: a.name, price: a.price })),
        gift_card: {
          to: cardMessage.to,
          from: cardMessage.from,
          note: cardMessage.note,
          cardDesign: cardMessage.cardDesign,
        },
      } as unknown as Product['metadata'],
    };

    addItem(bespokeProduct, 1);

    toast({
      title: 'Bespoke Gift Box Created!',
      description: `Added to your bag with ${selectedCandles.length} candles & personalized handwritten card.`,
    });
  };

  return (
    <div className="container-luxury py-8 md:py-14 animate-fade-in space-y-10">
      <SeoHelmet
        title="Build Your Own Luxury Gift Box | Sereniquee Candles"
        description="Craft a bespoke luxury candle gift hamper. Choose your rigid magnetic gift box, select hand-poured soy candles, add brass accessories, and compose a personalized calligraphy note."
        url="/gift-box"
      />

      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold uppercase tracking-widest">
          <Gift className="h-3.5 w-3.5 text-[#8c6239]" />
          Artisanal Gifting Studio
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-tight">
          Build Your Own Gift Box
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Curate a bespoke sensory sanctuary. Handpick your favorite soy fragrances, select a rigid magnetic keepsake box, and add an artisan calligraphy note.
        </p>
      </div>

      {/* Interactive Step Bar */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          {[
            { num: 1, label: '1. Box Format' },
            { num: 2, label: '2. Pick Candles' },
            { num: 3, label: '3. Accessories' },
            { num: 4, label: '4. Gift Note' },
          ].map(step => (
            <button
              key={step.num}
              type="button"
              onClick={() => setActiveStep(step.num as 1 | 2 | 3 | 4)}
              className={cn(
                'py-2.5 px-2 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200',
                activeStep === step.num
                  ? 'border-[#2c221e] bg-[#2c221e] text-white shadow-sm'
                  : 'border-[#eadfd1] bg-[#fdfaf5] text-muted-foreground hover:bg-white hover:text-foreground'
              )}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Configuration on Left, Visual Preview Box on Right */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* =======================================================
            LEFT COLUMN: Active Step Configuration (7 cols)
            ======================================================= */}
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: Choose Box Size & Finish */}
          {activeStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              {/* Box Size Tiers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
                    1. Select Box Tier & Capacity
                  </h3>
                  <span className="text-xs text-muted-foreground">Complimentary luxury packaging</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3.5">
                  {GIFT_BOX_TIERS.map(tier => {
                    const isSelected = selectedTier.id === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => {
                          setSelectedTier(tier);
                          // Trim candles if selected exceeds capacity
                          if (selectedCandles.length > tier.capacity) {
                            setSelectedCandles(prev => prev.slice(0, tier.capacity));
                          }
                        }}
                        className={cn(
                          'p-4 rounded-2xl border text-left transition-all duration-200 relative',
                          isSelected
                            ? 'border-[#2c221e] bg-white ring-2 ring-[#2c221e]/15 shadow-md'
                            : 'border-[#eadfd1] bg-[#fbf9f6] hover:bg-white'
                        )}
                      >
                        {tier.isPopular && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#2c221e] text-white text-[10px] font-bold uppercase tracking-wider">
                            Most Loved
                          </span>
                        )}
                        <p className="font-serif text-lg font-semibold text-foreground">{tier.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{tier.subtitle}</p>
                        <p className="font-serif text-base font-bold text-[#8c6239] mt-3">₹{tier.basePrice}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Box Finish & Color */}
              <div className="space-y-4">
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
                  2. Choose Box Aesthetic & Finish
                </h3>

                <div className="grid sm:grid-cols-3 gap-3.5">
                  {BOX_STYLES.map(style => {
                    const isSelected = selectedBoxStyle.id === style.id;
                    const isDark = style.id === 'midnight-obsidian';
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setSelectedBoxStyle(style)}
                        className={cn(
                          'p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group min-h-[140px]',
                          style.bgClass,
                          isDark ? 'text-white' : 'text-foreground',
                          isSelected
                            ? isDark
                              ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                              : 'border-[#2c221e] ring-2 ring-[#2c221e]/20 shadow-md'
                            : isDark
                              ? 'border-stone-700 hover:border-amber-400/50'
                              : 'border-[#eadfd1] hover:border-[#8c6239]/50'
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={cn(
                                'text-xs font-bold uppercase tracking-wide',
                                isDark ? 'text-amber-200' : 'text-foreground'
                              )}
                            >
                              {style.name}
                            </span>
                            {isSelected && (
                              <Check className={cn('h-4 w-4', isDark ? 'text-amber-300' : 'text-[#8c6239]')} />
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-[11px] leading-snug',
                              isDark ? 'text-stone-300' : 'text-muted-foreground'
                            )}
                          >
                            {style.description}
                          </p>
                        </div>
                        <p
                          className={cn(
                            'text-[11px] font-medium mt-3',
                            isDark ? 'text-amber-300' : 'text-[#8c6239]'
                          )}
                        >
                          Tied with {style.ribbonName}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="rounded-full px-6 bg-[#2c221e] text-white hover:bg-[#3d302a]"
                >
                  <span>Next: Choose {selectedTier.capacity} Candles</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Pick Candles for the Box */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
                    Select {selectedTier.capacity} Artisanal Candles
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedCandles.length} of {selectedTier.capacity} slots filled
                  </p>
                </div>

                <Input
                  type="text"
                  value={candleFilter}
                  onChange={e => setCandleFilter(e.target.value)}
                  placeholder="Filter by scent or name..."
                  className="sm:w-60 h-9 text-xs rounded-full border-[#eadfd1] bg-card"
                />
              </div>

              {/* Candles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto p-1 scrollbar-hide">
                {availableCandles.map(candle => {
                  const isSelectedInTray = selectedCandles.some(c => c.id === candle.id);
                  return (
                    <div
                      key={candle.id}
                      className={cn(
                        'rounded-2xl border p-3 bg-white flex flex-col justify-between transition-all duration-200 hover:shadow-sm',
                        isSelectedInTray ? 'border-[#8c6239] ring-1 ring-[#8c6239]/20' : 'border-[#eadfd1]'
                      )}
                    >
                      <div className="space-y-2">
                        <div className="aspect-square rounded-xl overflow-hidden bg-[#fbf9f6] border border-[#eadfd1]/70">
                          {candle.image_url ? (
                            <StorageImage
                              src={candle.image_url}
                              widths={[200]}
                              defaultWidth={200}
                              sizes="140px"
                              alt={candle.name}
                              width={160}
                              height={160}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              Sereniquee
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-serif text-sm font-semibold text-foreground truncate">{candle.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate capitalize">
                            {candle.category || 'Soy Candle'}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant={isSelectedInTray ? 'secondary' : 'outline'}
                        onClick={() => handleAddCandle(candle)}
                        disabled={selectedCandles.length >= selectedTier.capacity && !isSelectedInTray}
                        className="w-full mt-3 rounded-full text-xs h-8 border-[#eadfd1]"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {isSelectedInTray ? 'Add Another' : 'Add to Box'}
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep(1)}
                  className="rounded-full px-5 text-xs h-10 border-[#eadfd1]"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>

                <Button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  disabled={selectedCandles.length === 0}
                  className="rounded-full px-6 bg-[#2c221e] text-white hover:bg-[#3d302a]"
                >
                  <span>Next: Add Accessories</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Curate Brass Accessories */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
                  Care Accessories & Gifting Touches
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Elevate the recipient's ritual with solid brass candle care instruments.
                </p>
              </div>

              <div className="space-y-3">
                {GIFT_ACCESSORIES.map(acc => {
                  const isChecked = selectedAccessories.some(a => a.id === acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccessory(acc)}
                      className={cn(
                        'p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-4',
                        isChecked
                          ? 'border-[#2c221e] bg-white ring-1 ring-[#2c221e]/20 shadow-sm'
                          : 'border-[#eadfd1] bg-[#fbf9f6] hover:bg-white'
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                            isChecked ? 'bg-[#2c221e] text-white' : 'bg-[#f0e8de] text-[#8c6239]'
                          )}
                        >
                          {acc.iconName === 'Scissors' ? (
                            <Scissors className="h-5 w-5" />
                          ) : acc.iconName === 'Flame' ? (
                            <Flame className="h-5 w-5" />
                          ) : (
                            <Sparkles className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-serif text-base font-semibold text-foreground">{acc.name}</p>
                          <p className="text-xs text-muted-foreground max-w-md">{acc.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-serif text-sm font-bold text-[#8c6239]">+₹{acc.price}</p>
                        <span
                          className={cn(
                            'text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-1',
                            isChecked ? 'bg-amber-100 text-amber-900 border border-amber-300/80' : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {isChecked ? 'Included' : '+ Add'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep(2)}
                  className="rounded-full px-5 text-xs h-10 border-[#eadfd1]"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>

                <Button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="rounded-full px-6 bg-[#2c221e] text-white hover:bg-[#3d302a]"
                >
                  <span>Next: Compose Gift Note</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Compose Calligraphy Gift Note */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
                  Complimentary Calligraphy Card
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  We print your words on textured linen paper and tuck it gently into the gift box ribbon.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      To / Recipient Name
                    </label>
                    <Input
                      value={cardMessage.to}
                      onChange={e => setCardMessage(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="e.g. Dearest Ananya"
                      className="rounded-xl border-[#eadfd1] bg-card text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      From / Sender Name
                    </label>
                    <Input
                      value={cardMessage.from}
                      onChange={e => setCardMessage(prev => ({ ...prev, from: e.target.value }))}
                      placeholder="e.g. With love, Rohan"
                      className="rounded-xl border-[#eadfd1] bg-card text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Your Personal Message
                  </label>
                  <Textarea
                    value={cardMessage.note}
                    onChange={e => setCardMessage(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Wishing you warmth, peace, and beautiful aromatic evenings in your new home..."
                    rows={4}
                    maxLength={250}
                    className="rounded-2xl border-[#eadfd1] bg-card text-xs sm:text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground text-right mt-1">
                    {cardMessage.note.length}/250 characters
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep(3)}
                  className="rounded-full px-5 text-xs h-10 border-[#eadfd1]"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>

                <Button
                  type="button"
                  onClick={handleCompleteBox}
                  className="rounded-full px-7 bg-[#2c221e] text-white hover:bg-[#3d302a] font-medium shadow-md"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  <span>Add Bespoke Box to Bag • ₹{totalPrice.toLocaleString('en-IN')}</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* =======================================================
            RIGHT COLUMN: Live Interactive Box & Card Preview (5 cols)
            ======================================================= */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          {/* Visual Box Container */}
          <div
            className={cn(
              'rounded-3xl border p-6 transition-all duration-300 space-y-5 shadow-[0_8px_30px_rgba(44,34,30,0.06)]',
              selectedBoxStyle.id === 'midnight-obsidian'
                ? 'bg-[#1e2022] border-stone-700 text-white shadow-stone-950/40'
                : selectedBoxStyle.id === 'cashmere-sand'
                  ? 'bg-[#f6efe5] border-[#dfd0be] text-foreground'
                  : 'bg-[#fdfaf5] border-[#eadfd1] text-foreground'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between border-b pb-3',
                selectedBoxStyle.id === 'midnight-obsidian' ? 'border-stone-800' : 'border-[#eadfd1]'
              )}
            >
              <div>
                <p
                  className={cn(
                    'font-serif text-lg font-semibold',
                    selectedBoxStyle.id === 'midnight-obsidian' ? 'text-white' : 'text-foreground'
                  )}
                >
                  {selectedTier.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      selectedBoxStyle.id === 'midnight-obsidian' ? 'text-amber-300' : 'text-[#8c6239]'
                    )}
                  >
                    {selectedBoxStyle.name}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border',
                      selectedBoxStyle.id === 'midnight-obsidian'
                        ? 'bg-stone-800 border-stone-700 text-stone-300'
                        : 'bg-white border-[#eadfd1] text-muted-foreground'
                    )}
                  >
                    {selectedBoxStyle.ribbonName}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  'font-serif text-2xl font-bold',
                  selectedBoxStyle.id === 'midnight-obsidian' ? 'text-amber-300' : 'text-foreground'
                )}
              >
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Candle Slots Tray */}
            <div className="space-y-2">
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  selectedBoxStyle.id === 'midnight-obsidian' ? 'text-stone-400' : 'text-muted-foreground'
                )}
              >
                Candle Tray ({selectedCandles.length}/{selectedTier.capacity})
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {Array.from({ length: selectedTier.capacity }).map((_, index) => {
                  const candle = selectedCandles[index];
                  return (
                    <div
                      key={index}
                      className={cn(
                        'aspect-[4/3] rounded-2xl border p-2 flex flex-col justify-between relative transition-all duration-200',
                        candle
                          ? 'border-[#8c6239]/60 bg-white shadow-sm text-foreground'
                          : selectedBoxStyle.id === 'midnight-obsidian'
                            ? 'border-dashed border-stone-700 bg-stone-900/60 items-center justify-center text-stone-300'
                            : 'border-dashed border-[#eadfd1] bg-[#fbf9f6] items-center justify-center'
                      )}
                    >
                      {candle ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRemoveCandle(index)}
                            className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-muted/80 hover:bg-destructive hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
                            title="Remove candle"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="h-9 w-9 rounded-lg overflow-hidden bg-[#fbf9f6] border border-[#eadfd1]/60">
                            {candle.image_url ? (
                              <img src={candle.image_url} alt={candle.name} className="w-full h-full object-cover" />
                            ) : (
                              <Flame className="h-4 w-4 m-auto text-[#8c6239]" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="font-serif text-xs font-semibold truncate text-foreground">{candle.name}</p>
                            <p className="text-[10px] text-muted-foreground">Slot {index + 1}</p>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveStep(2)}
                          className={cn(
                            'text-center p-2 cursor-pointer transition-colors',
                            selectedBoxStyle.id === 'midnight-obsidian'
                              ? 'text-stone-400 hover:text-amber-300'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Plus className="h-4 w-4 mx-auto mb-1 opacity-60" />
                          <span className="text-[11px] font-medium block">Slot {index + 1} Empty</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Accessories summary */}
            {selectedAccessories.length > 0 && (
              <div
                className={cn(
                  'space-y-1.5 pt-2 border-t',
                  selectedBoxStyle.id === 'midnight-obsidian' ? 'border-stone-800' : 'border-[#eadfd1]/70'
                )}
              >
                <p
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider',
                    selectedBoxStyle.id === 'midnight-obsidian' ? 'text-stone-400' : 'text-muted-foreground'
                  )}
                >
                  Care Instruments
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAccessories.map(acc => (
                    <span
                      key={acc.id}
                      className={cn(
                        'inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border',
                        selectedBoxStyle.id === 'midnight-obsidian'
                          ? 'bg-stone-900 border-stone-700 text-stone-200'
                          : 'bg-white border-[#eadfd1] text-foreground'
                      )}
                    >
                      <span>{acc.name}</span>
                      <button type="button" onClick={() => toggleAccessory(acc)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Calligraphy Card Live Preview */}
            <div
              className={cn(
                'pt-2 border-t space-y-1.5',
                selectedBoxStyle.id === 'midnight-obsidian' ? 'border-stone-800' : 'border-[#eadfd1]/70'
              )}
            >
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  selectedBoxStyle.id === 'midnight-obsidian' ? 'text-stone-400' : 'text-muted-foreground'
                )}
              >
                Artisanal Gift Card
              </p>
              <div
                className={cn(
                  'p-4 rounded-2xl border shadow-inner text-center font-serif space-y-2',
                  selectedBoxStyle.id === 'midnight-obsidian'
                    ? 'bg-stone-900/90 border-stone-800 text-stone-200'
                    : 'bg-[#fffdfa] border-[#e8ded1] text-foreground'
                )}
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8c6239] font-sans font-semibold">
                  A Gift For You
                </p>
                <p
                  className={cn(
                    'text-sm font-medium italic',
                    selectedBoxStyle.id === 'midnight-obsidian' ? 'text-amber-200' : 'text-foreground'
                  )}
                >
                  {cardMessage.to ? `Dearest ${cardMessage.to},` : 'To Recipient,'}
                </p>
                <p
                  className={cn(
                    'text-xs italic leading-relaxed px-2 line-clamp-3',
                    selectedBoxStyle.id === 'midnight-obsidian' ? 'text-stone-300' : 'text-muted-foreground'
                  )}
                >
                  "{cardMessage.note || 'May these handcrafted scents fill your home with light and peace.'}"
                </p>
                <p
                  className={cn(
                    'text-xs font-medium italic pt-1',
                    selectedBoxStyle.id === 'midnight-obsidian' ? 'text-amber-200' : 'text-foreground'
                  )}
                >
                  {cardMessage.from ? cardMessage.from : 'With Love & Warmth'}
                </p>
              </div>
            </div>

            {/* Final CTA */}
            <Button
              type="button"
              onClick={handleCompleteBox}
              className="w-full h-12 rounded-full bg-[#2c221e] text-white hover:bg-[#3d302a] font-medium shadow-md text-sm"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span>Add to Bag • ₹{totalPrice.toLocaleString('en-IN')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
