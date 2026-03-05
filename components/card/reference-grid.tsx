// AUTO-GENERATED grid template for Card
// ⚠️  ADJUST BEFORE USING:
//   1. Fix imports (add subcomponents, icons as needed)
//   2. Adjust JSX for compound components (e.g., Tabs.Root > Tabs.List > Tabs.Trigger)
//   3. Use correct content pattern (children vs label prop)
//   4. Verify each variant renders correctly before extraction

import { Card } from '@snowflake/stellar-components'

export default function Reference() {
  return (
    <div data-component="card" style={{
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
          regular
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Card size="regular">Label</Card>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          small
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Card size="small">Label</Card>
      </div>

      {/* === STATES === */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          disabled
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Card disabled>Label</Card>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          selected
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Card selected>Label</Card>
      </div>
    </div>
  )
}
