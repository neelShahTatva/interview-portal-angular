import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ButtonSize, ButtonType, ButtonVariant } from './models/button.model';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  host: {
    '[class.w-full]': 'fullWidth()',
    '[class.inline-block]': '!fullWidth()',
    '[class.pointer-events-none]': 'disabled() || loading()',
    '[attr.aria-disabled]': 'disabled() || loading()',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('');
  readonly fullWidth = input<boolean>(false);
  readonly customClass = input<string>('');

  readonly btnClick = output<MouseEvent>();

  readonly buttonClasses = computed(() => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold cursor-pointer border select-none transition duration-200 outline-none focus:outline-none';

    // Width
    const widthClass = this.fullWidth() ? 'w-full' : '';

    // Variant classes
    let variantClass = '';
    switch (this.variant()) {
      case 'primary':
        variantClass =
          'bg-[#08132f] text-white border-transparent hover:bg-[#14234b] active:bg-[#060e24] shadow-sm';
        break;
      case 'secondary':
        variantClass =
          'bg-[#f1f5f9] text-[#334155] border-transparent hover:bg-[#e2e8f0] active:bg-[#cbd5e1]';
        break;
      case 'danger':
        variantClass =
          'bg-[#dc2626] text-white border-transparent hover:bg-[#b91c1c] active:bg-[#991b1b] shadow-sm';
        break;
      case 'outline':
        variantClass =
          'border-[#d1d5db] bg-white text-[#334155] hover:bg-[#f8fafc] active:bg-[#f1f5f9]';
        break;
      case 'ghost':
        variantClass =
          'border-transparent bg-transparent text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]';
        break;
      case 'link':
        variantClass =
          'border-transparent bg-transparent text-[#2563eb] hover:underline p-0 h-auto shadow-none';
        break;
    }

    // Size classes
    let sizeClass = '';
    switch (this.size()) {
      case 'sm':
        sizeClass = 'h-8 px-3 text-xs rounded-lg gap-1.5';
        break;
      case 'md':
        sizeClass = 'h-[42px] px-4 text-sm rounded-[10px] gap-2';
        break;
      case 'lg':
        sizeClass = 'h-[48px] px-6 text-sm rounded-[10px] gap-2.5';
        break;
      case 'icon':
        sizeClass = 'w-10 h-10 p-0 rounded-xl flex items-center justify-center shrink-0';
        break;
      case 'icon-sm':
        sizeClass = 'w-8 h-8 p-0 rounded-lg flex items-center justify-center shrink-0';
        break;
    }

    // Disabled / Loading classes
    const stateClass =
      this.disabled() || this.loading()
        ? 'opacity-60 cursor-not-allowed pointer-events-none'
        : '';

    return [
      baseClasses,
      widthClass,
      variantClass,
      sizeClass,
      stateClass,
      this.customClass(),
    ]
      .filter(Boolean)
      .join(' ');
  });

  handleClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.btnClick.emit(event);
  }
}
