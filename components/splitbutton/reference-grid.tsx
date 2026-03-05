// AUTO-GENERATED grid template for SplitButton
// ⚠️  ADJUST BEFORE USING:
//   1. Fix imports (add subcomponents, icons as needed)
//   2. Adjust JSX for compound components (e.g., Tabs.Root > Tabs.List > Tabs.Trigger)
//   3. Use correct content pattern (children vs label prop)
//   4. Verify each variant renders correctly before extraction

import { SplitButton } from '@snowflake/stellar-components'

export default function Reference() {
  return (
    <div data-component="splitbutton" style={{
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
          primary
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <SplitButton variant="primary">Label</SplitButton>
      </div>

      {/* === STATES === */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          primary + disabled
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <SplitButton disabled variant="primary">Label</SplitButton>
      </div>
    </div>
  )
}
