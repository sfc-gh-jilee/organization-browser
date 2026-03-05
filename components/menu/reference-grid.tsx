// AUTO-GENERATED grid template for Menu
// ⚠️  ADJUST BEFORE USING:
//   1. Fix imports (add subcomponents, icons as needed)
//   2. Adjust JSX for compound components (e.g., Tabs.Root > Tabs.List > Tabs.Trigger)
//   3. Use correct content pattern (children vs label prop)
//   4. Verify each variant renders correctly before extraction

import { Menu } from '@snowflake/stellar-components'

export default function Reference() {
  return (
    <div data-component="menu" style={{
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      background: '#ffffff',
      minHeight: '100vh',
      alignItems: 'flex-start',
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          checkbox
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Menu variant="checkbox">Label</Menu>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          default
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Menu variant="default">Label</Menu>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          radio
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Menu variant="radio">Label</Menu>
      </div>

      {/* === STATES === */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          checkbox + isLoading
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Menu isLoading variant="checkbox">Label</Menu>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          checkbox + selected
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Menu selected variant="checkbox">Label</Menu>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          checkbox + disabled
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Menu disabled variant="checkbox">Label</Menu>
      </div>
    </div>
  )
}
