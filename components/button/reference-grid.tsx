// AUTO-GENERATED grid template for Button
// ⚠️  ADJUST BEFORE USING:
//   1. Fix imports (add subcomponents, icons as needed)
//   2. Adjust JSX for compound components (e.g., Tabs.Root > Tabs.List > Tabs.Trigger)
//   3. Use correct content pattern (children vs label prop)
//   4. Verify each variant renders correctly before extraction

import { Button } from '@snowflake/stellar-components'

export default function Reference() {
  return (
    <div data-component="button" style={{
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
          primary / regular
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button variant="primary" size="regular">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          primary / small
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button variant="primary" size="small">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          primary-critical / regular
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button variant="primary-critical" size="regular">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          primary-critical / small
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button variant="primary-critical" size="small">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          secondary / regular
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button variant="secondary" size="regular">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          secondary / small
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button variant="secondary" size="small">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          tertiary / regular
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button variant="tertiary" size="regular">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          tertiary / small
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button variant="tertiary" size="small">Label</Button>
      </div>

      {/* === STATES === */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          primary + selected
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button selected variant="primary">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          primary + fullWidth
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button fullWidth variant="primary">Label</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ minWidth: '180px', fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>
          primary + isLoading
        </span>
        {/* TODO: adjust for subcomponents, children vs label props */}
        <Button isLoading variant="primary">Label</Button>
      </div>
    </div>
  )
}
