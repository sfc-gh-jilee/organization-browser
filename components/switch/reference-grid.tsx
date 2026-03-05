// AUTO-GENERATED grid template for Switch
// ⚠️  ADJUST BEFORE USING:
//   1. Fix imports (add subcomponents, icons as needed)
//   2. Adjust JSX for compound components (e.g., Tabs.Root > Tabs.List > Tabs.Trigger)
//   3. Use correct content pattern (children vs label prop)
//   4. Verify each variant renders correctly before extraction

import { Switch } from '@snowflake/stellar-components'

export default function Reference() {
  return (
    <div data-component="switch" style={{
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
          default
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Switch>Label</Switch>
      </div>

      {/* === STATES === */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          disabled
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Switch disabled>Label</Switch>
      </div>
    </div>
  )
}
