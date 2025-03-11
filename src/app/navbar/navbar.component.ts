import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  showDropdown: boolean = false;

  constructor(private router: Router, private elementRef: ElementRef) {}

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  isNormasActive(): boolean {
    return (
      this.router.url.includes('/medias-normas') ||
      this.router.url.includes('/porcentajes-normas')
    );
  }

  // 🔹 Detecta clics fuera del menú desplegable y lo cierra
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}
