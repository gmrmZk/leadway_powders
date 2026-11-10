// =============================================
// LEADWAY POWDERS — Hero slideshow + mobile menu + cart + newsletter
// =============================================

const slides = [
  {
    eyebrow: 'The right ingredients. The right partner.',
    title: 'A better supply',
    accent: 'partnership for your business',
    description: 'We believe great food and beverage businesses begin with the right ingredients and the right supply partner. We source a diverse range of powders through our manufacturing partners.',
    button: 'Explore Products',
  },
  {
    eyebrow: 'Flexible solutions for businesses',
    title: 'Sourcing for',
    accent: 'your kind of business',
    description: 'We help bubble tea businesses, cafés, restaurants, dessert shops, food-service operations and wholesale distributors access quality-focused products and flexible solutions for their commercial needs.',
    button: 'Explore Products',
  },
  {
    eyebrow: 'A partner beyond the ingredient price',
    title: 'Business value',
    accent: 'in every partnership',
    description: 'Your business depends on more than ingredient price: consistency, availability, product performance and commercial value all matter.',
    button: 'Explore Products',
  },
]

import { initMobileNav } from './navigation.js';

// ---------- Mobile hamburger menu ----------
initMobileNav();

// ---------- Hero slideshow ----------
let currentSlide = 0
let slideTimer

function updateSlide(nextIndex) {
  const content = document.querySelector('.hero-content')
  content.classList.add('is-changing')

  setTimeout(() => {
    currentSlide = (nextIndex + slides.length) % slides.length
    const slide = slides[currentSlide]

    document.getElementById('heroEyebrow').textContent = slide.eyebrow
    document.getElementById('heroTitle').firstChild.textContent = slide.title
    document.getElementById('heroAccent').textContent = slide.accent
    document.getElementById('heroDescription').textContent = slide.description
    document.getElementById('heroButton').firstChild.textContent = slide.button
    document.getElementById('slideCurrent').textContent = '0' + (currentSlide + 1)

    document.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide)
    })

    content.classList.remove('is-changing')
  }, 350)
}

function restartTimer() {
  clearInterval(slideTimer)
  slideTimer = setInterval(() => updateSlide(currentSlide + 1), 6000)
}

document.getElementById('nextSlide').addEventListener('click', () => {
  updateSlide(currentSlide + 1)
  restartTimer()
})

document.getElementById('previousSlide').addEventListener('click', () => {
  updateSlide(currentSlide - 1)
  restartTimer()
})

document.querySelectorAll('.dot').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    updateSlide(index)
    restartTimer()
  })
})

restartTimer()
