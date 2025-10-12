import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

interface ReceiptPreviewProps {
  src: string;
  alt?: string;
  triggerClassName?: string;
}

export default function ReceiptPreview({ src, alt = 'Comprobante', triggerClassName }: ReceiptPreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <a className={triggerClassName || 'block cursor-pointer'} tabIndex={0} aria-label="Ver comprobante">
          <img src={src} alt={alt} className="max-w-[180px] max-h-[180px] rounded border object-contain" />
        </a>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Comprobante</DialogTitle>
        <img src={src} alt={alt} className="w-full h-auto rounded border object-contain" />
      </DialogContent>
    </Dialog>
  );
}
