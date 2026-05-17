import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
    selector: 'app-home-page',
    standalone: true,
    templateUrl: './home_page.html',
    styleUrls: ['./home_page.css']
})
export class HomePageComponent implements AfterViewInit {
    @ViewChild('searchBox') private searchInput?: ElementRef<HTMLInputElement>;

    ngAfterViewInit(): void {
        queueMicrotask(() => this.searchInput?.nativeElement.focus());
    }

    search(q: string) {
        const query = encodeURIComponent((q ?? '').trim());
        if (!query) return;
        window.location.href = `https://www.google.com/search?q=${query}`;
    }

    @HostListener('document:paste', ['$event'])
    handlePaste(event: ClipboardEvent) {
        const text = event.clipboardData?.getData('text') ?? '';
        const input = this.searchInput?.nativeElement;
        if (!input || !text.trim()) return;

        event.preventDefault();
        const targetIsInput = event.target === input;
        const selectionStart = targetIsInput ? input.selectionStart ?? input.value.length : input.value.length;
        const selectionEnd = targetIsInput ? input.selectionEnd ?? input.value.length : input.value.length;

        const value = input.value;
        input.value = `${value.slice(0, selectionStart)}${text}${value.slice(selectionEnd)}`;

        const caret = selectionStart + text.length;
        input.setSelectionRange?.(caret, caret);
        input.focus();
    }
}
