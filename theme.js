(() => {
  const system = matchMedia('(prefers-color-scheme: dark)')
  const key = 'world-atlas-appearance'
  let choice = 'System'
  try { choice = localStorage.getItem(key) || choice } catch {}
  function apply() {
    if (!['Light','Dark','System'].includes(choice)) choice = 'System'
    const dark = choice === 'Dark' || (choice === 'System' && system.matches)
    document.documentElement.dataset.theme = dark ? 'Dark' : 'Light'
    document.querySelector('meta[name="theme-color"]').content = dark ? '#13292e' : '#f2f3eb'
    window.dispatchEvent(new Event('atlas-theme'))
  }
  apply()
  system.addEventListener('change', apply)
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('appearance')
    select.value = choice
    select.onchange = () => {
      choice = select.value
      try { localStorage.setItem(key, choice) } catch {}
      apply()
    }
  })
})()
