(() => {
  const system = matchMedia('(prefers-color-scheme: dark)')
  try { localStorage.removeItem('world-atlas-appearance') } catch {}
  function apply() {
    document.documentElement.dataset.theme = system.matches ? 'Dark' : 'Light'
    document.querySelector('meta[name="theme-color"]').content = system.matches ? '#13292e' : '#f2f3eb'
    window.dispatchEvent(new Event('atlas-theme'))
  }
  apply()
  system.addEventListener('change', apply)
})()
