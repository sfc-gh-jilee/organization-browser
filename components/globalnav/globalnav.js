/**
 * GlobalNav — Vanilla JS from Stellar Design System
 *
 * All SVG icons are inlined — no fetch() calls, works with file:// protocol.
 *
 * Usage:
 *   <aside data-component="globalnav" data-active="projects">
 *     ...
 *   </aside>
 */

class StellarGlobalNav {
  /* ------------------------------------------------
   * Inlined SVG icons (16×16, currentColor)
   * ------------------------------------------------ */

  static SVG = {
    projects: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><g fill="currentColor"><path d="M11 11H7v-1h4zM8.207 8l-2.853 2.854-.708-.707L6.793 8 4.646 5.854l.708-.708z"/><path fill-rule="evenodd" d="M12.5 2A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2zm-9 1a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z" clip-rule="evenodd"/></g></svg>',
    ingestion: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><g fill="currentColor"><path d="M8 6.499c.133 0 .26.055.354.148l3 3-.707.707L8.5 8.207V14h-1V8.207l-2.146 2.146-.708-.707 3-2.999A.5.5 0 0 1 8 6.5"/><path d="M7.918 2.004a3.97 3.97 0 0 1 3.651 2.965A3.533 3.533 0 0 1 15 8.5l-.004.176a3.534 3.534 0 0 1-3.348 3.352l-.012.001-.156.004H11v-1h.454l.151-.004a2.53 2.53 0 0 0 2.382-2.278L14 8.5c0-1.312-.997-2.39-2.274-2.52l-.26-.013q-.13 0-.253.012l-.479.047-.066-.475a2.97 2.97 0 0 0-2.66-2.538L7.732 3a2.967 2.967 0 0 0-2.966 2.967l.004.163q.004.08.012.158l.064.594-.596-.041a2 2 0 0 0-.15-.008 2.1 2.1 0 0 0-2.1 2.1l.01.215a2.1 2.1 0 0 0 2.09 1.885H5v1h-.9a3.1 3.1 0 0 1-3.096-2.94L1 8.933a3.1 3.1 0 0 1 2.767-3.082A3.967 3.967 0 0 1 7.73 2z"/></g></svg>',
    transformation: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M14 2a1 1 0 0 1 1 1v3a1 1 0 0 1-.898.995L14 7h-3l-.102-.005a1 1 0 0 1-.893-.892L10 6V5H9a.5.5 0 0 0-.5.5V7c0 .385-.146.734-.385 1 .239.266.385.615.385 1v1.5a.5.5 0 0 0 .5.5h1v-1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-.898.995L14 14h-3l-.102-.005a1 1 0 0 1-.893-.893L10 13v-1H9a1.5 1.5 0 0 1-1.5-1.5V9a.5.5 0 0 0-.5-.5H6v1a1 1 0 0 1-.897.995L5 10.5H2l-.103-.005a1 1 0 0 1-.892-.892L1 9.5v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1h1a.5.5 0 0 0 .5-.5V5.5A1.5 1.5 0 0 1 9 4h1V3a1 1 0 0 1 1-1zm-3 11h3v-3h-3zM2 9.5h3v-3H2zM11 6h3V3h-3z" clip-rule="evenodd"/></svg>',
    "ai-ml": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><g fill="currentColor"><path fill-rule="evenodd" d="M11.347 9.026a.491.491 0 0 1 .918 0 3.92 3.92 0 0 0 2.141 2.216l.2.078.065.023a.496.496 0 0 1 0 .935l-.207.08a3.97 3.97 0 0 0-2.19 2.314.498.498 0 0 1-.902.077l-.034-.077a3.98 3.98 0 0 0-2.398-2.394l-.077-.034a.497.497 0 0 1 .077-.9l.065-.024a3.93 3.93 0 0 0 2.26-2.097zm.459 1.289a4.9 4.9 0 0 1-1.544 1.503c.623.395 1.15.923 1.544 1.547a5 5 0 0 1 1.543-1.547 4.9 4.9 0 0 1-1.543-1.503M5.395 1.53c.258-.707 1.26-.707 1.517 0a6.46 6.46 0 0 0 3.864 3.86c.708.257.708 1.257 0 1.515l-.332.13a6.46 6.46 0 0 0-3.532 3.728c-.241.663-1.137.704-1.46.124l-.057-.124a6.46 6.46 0 0 0-3.863-3.858l-.125-.057c-.582-.323-.54-1.218.125-1.459a6.46 6.46 0 0 0 3.731-3.527zm.759.79a7.45 7.45 0 0 1-3.831 3.826 7.45 7.45 0 0 1 3.83 3.826 7.45 7.45 0 0 1 3.83-3.826 7.45 7.45 0 0 1-3.83-3.825" clip-rule="evenodd"/><path d="M14 3h1v1h-1v1h-1V4h-1V3h1V2h1z"/></g></svg>',
    monitoring: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" d="M6.013 2a.5.5 0 0 1 .445.3l3.565 10.143 2.028-5.162.035-.061A.5.5 0 0 1 12.5 7H15v1h-2.187l-2.364 5.853a.5.5 0 0 1-.907-.018L5.97 3.678 3.947 8.724A.5.5 0 0 1 3.5 9H1V8h2.191l2.362-5.723.037-.062A.5.5 0 0 1 6.013 2"/></svg>',
    marketplace: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M13.5 2a.5.5 0 0 1 .48.362l.462 1.616c.178.62.377 1.359.401 2.069.025.72-.127 1.479-.72 2.072q-.06.058-.123.112V12.5a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1-.5-.5V11H7v2.5a.5.5 0 0 1-.5.5h-3A1.5 1.5 0 0 1 2 12.5V8.231q-.064-.054-.124-.112c-.592-.593-.745-1.352-.72-2.072.025-.71.224-1.448.401-2.07l.462-1.615.03-.077A.5.5 0 0 1 2.498 2zM10 8.23a2.98 2.98 0 0 1-4 0 2.98 2.98 0 0 1-3 .595V12.5a.5.5 0 0 0 .5.5H6v-2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V13h2.5a.5.5 0 0 0 .5-.5V8.825a2.98 2.98 0 0 1-3-.596M2.52 4.251c-.18.63-.345 1.257-.365 1.83-.02.561.102 1.004.429 1.331a1.993 1.993 0 0 0 2.916-.1V5h1v2.312c.367.42.9.688 1.5.688.598 0 1.132-.267 1.5-.687V5h1v2.312a1.993 1.993 0 0 0 2.916.102c.326-.328.448-.77.428-1.333-.02-.572-.184-1.2-.364-1.83L13.123 3H2.877z" clip-rule="evenodd"/></svg>',
    catalog: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M8.001 2c1.303 0 2.509.263 3.406.71.868.434 1.595 1.126 1.595 2.039q0 .086-.008.169.008.09.008.182v5.822l-.006.134v.011l-.002.011c-.08.923-.767 1.658-1.646 2.143-.782.43-1.783.704-2.874.766L8 14.001c-1.315 0-2.53-.307-3.433-.83C3.678 12.659 3 11.873 3 10.902V5.1q0-.095.008-.186A2 2 0 0 1 3 4.75c0-.912.727-1.605 1.595-2.038C5.492 2.263 6.697 2 8 2m4.001 4.427a4 4 0 0 1-.595.36c-.897.447-2.103.71-3.406.71-1.304 0-2.509-.262-3.406-.71A4 4 0 0 1 4 6.426V10.9c0 .464.33.98 1.068 1.407.726.419 1.762.694 2.933.694l.419-.012c.962-.055 1.813-.296 2.445-.644.732-.404 1.089-.898 1.131-1.348l.006-.118zM8.001 3c-1.17 0-2.207.275-2.933.694-.633.366-.966.798-1.047 1.205.073.305.371.668 1.021.993.731.365 1.777.605 2.959.605s2.228-.24 2.959-.605c.65-.325.946-.688 1.02-.993-.081-.407-.413-.839-1.046-1.205-.635-.366-1.508-.623-2.5-.681z" clip-rule="evenodd"/></svg>',
    "data-sharing": '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M8 1a2.5 2.5 0 0 1 2.5 2.5c0 .033-.005.067-.006.1a5.5 5.5 0 0 1 2.96 5.59 2.5 2.5 0 1 1-2.72 4.079A5.46 5.46 0 0 1 8 14a5.47 5.47 0 0 1-2.735-.73 2.5 2.5 0 1 1-2.72-4.08 5.5 5.5 0 0 1 2.96-5.59L5.5 3.5A2.5 2.5 0 0 1 8 1m-4.5 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m2.258-5.4A4.5 4.5 0 0 0 3.528 9a2.5 2.5 0 0 1 2.29 3.43 4.47 4.47 0 0 0 4.363 0A2.5 2.5 0 0 1 12.47 9q.029-.247.03-.501c0-1.669-.91-3.122-2.259-3.9a2.497 2.497 0 0 1-4.483 0M12.5 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M8 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" clip-rule="evenodd"/></svg>',
    governance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" d="M13 4.35 8 2.53 3 4.35V7c0 2.555 1.268 4.172 2.556 5.167a8.6 8.6 0 0 0 2.37 1.285l.074.024.073-.024a8.6 8.6 0 0 0 2.371-1.285C11.732 11.172 13 9.555 13 7zM14 7c0 2.945-1.482 4.828-2.944 5.958a9.6 9.6 0 0 1-2.657 1.44l-.191.062-.054.016-.015.004-.004.002h-.002a.5.5 0 0 1-.2.013l-.065-.012-.003-.002h-.004l-.015-.005-.054-.016-.191-.062a9.6 9.6 0 0 1-2.656-1.44C3.481 11.828 2 9.945 2 7V4a.5.5 0 0 1 .33-.47l5.5-2a.5.5 0 0 1 .34 0l5.5 2A.5.5 0 0 1 14 4z"/></svg>',
    compute: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" d="M9.112 1.184a.5.5 0 0 1 .885.366L9.55 6H13a.5.5 0 0 1 .387.815l-6.5 8a.5.5 0 0 1-.884-.365L6.448 10H3a.5.5 0 0 1-.388-.816zM4.049 9H7a.5.5 0 0 1 .498.55l-.335 3.34L11.95 7H9a.5.5 0 0 1-.497-.55l.334-3.342z"/></svg>',
    postgres: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><g fill="currentColor"><path d="M12.5 5.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5"/><path fill-rule="evenodd" d="M4.256.846a1.5 1.5 0 0 1 1.488 0L8.36 2.34c.124.07.272.085.407.04l.31-.103C11.991 1.305 15 3.475 15 6.547l.001 4.954a3.5 3.5 0 0 1-3.5 3.5H8.999L9 12h2.5a.5.5 0 0 0 .5-.5V11H9.531c-.498 0-.964-.249-1.243-.662L8 9.912v1.784c0 .478-.45.828-.913.712A8.03 8.03 0 0 1 1 4.618V3.165c0-.284.153-.547.4-.688zm.992.868a.5.5 0 0 0-.496 0L2 3.286v1.331a7.03 7.03 0 0 0 5 6.73V8h1v.125L9.116 9.78c.093.137.25.22.415.22H12.4a.6.6 0 0 1 .601.6v.9a1.5 1.5 0 0 1-1.5 1.5H9.999v1h1.502a2.5 2.5 0 0 0 2.5-2.499L14 6.546c0-2.389-2.34-4.076-4.606-3.32l-.312.103a1.5 1.5 0 0 1-1.218-.12z" clip-rule="evenodd"/></g></svg>',
    admin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" d="M10.518 6.759a3.76 3.76 0 0 0-4.065-3.747L8.48 5.038a.5.5 0 0 1 0 .707L5.746 8.48a.5.5 0 0 1-.708 0L3.012 6.453Q3 6.603 3 6.76a3.76 3.76 0 0 0 4.897 3.582l.068-.017a.5.5 0 0 1 .437.14l2.683 2.682-.707.707L7.9 11.377c-.366.09-.748.142-1.141.142a4.76 4.76 0 0 1-4.527-6.23.5.5 0 0 1 .83-.2l2.33 2.33 2.026-2.026-2.33-2.33a.5.5 0 0 1 .2-.83 4.76 4.76 0 0 1 6.23 4.526c0 .394-.052.776-.142 1.141l2.478 2.478-.707.707-2.683-2.683a.5.5 0 0 1-.123-.505c.114-.359.177-.74.177-1.137"/></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M7.36 2.247c.406-.19.877-.188 1.282.005l4.504 2.146c.521.25.854.777.854 1.355V12.5a1.5 1.5 0 0 1-1.5 1.5H9v-4H7v4H3.5A1.5 1.5 0 0 1 2 12.5V5.708a1.5 1.5 0 0 1 .864-1.358zm.85.907a.5.5 0 0 0-.426 0l-4.496 2.1A.5.5 0 0 0 3 5.709V12.5a.5.5 0 0 0 .5.5H6V9.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V13h2.5a.5.5 0 0 0 .5-.5V5.753a.5.5 0 0 0-.285-.451z" clip-rule="evenodd"/></svg>',
    create: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" d="M8.5 7.505h5v1h-5V13.5h-1V8.505h-5v-1h5V2.5h1z"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M7 2a5 5 0 0 1 3.871 8.164l3.983 3.983-.707.707-3.983-3.983A5 5 0 1 1 7 2m0 1a4 4 0 1 0 0 8 4 4 0 0 0 0-8" clip-rule="evenodd"/></svg>',
    collapse: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" d="M4.5 8a.5.5 0 0 0 .146.354l4.5 4.5.708-.707L6.207 8.5H14v-1H6.207l3.647-3.646-.708-.708-4.5 4.5A.5.5 0 0 0 4.5 8M3 14V2H2v12z"/></svg>',
    expand: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><path fill="currentColor" d="M11.5 8a.5.5 0 0 1-.146.354l-4.5 4.5-.708-.707L9.793 8.5H2v-1h7.793L6.146 3.854l.708-.708 4.5 4.5A.5.5 0 0 1 11.5 8m1.5 6V2h1v12z"/></svg>',
    notifications: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true"><g fill="currentColor"><path d="M7 13c0 .106.05.214.229.32.188.11.47.18.771.18.3 0 .583-.07.771-.18.18-.106.229-.214.229-.32h1c0 .56-.334.953-.722 1.18-.378.223-.846.32-1.278.32s-.9-.097-1.278-.32C6.334 13.954 6 13.56 6 13z"/><path fill-rule="evenodd" d="M8.071 2a4.786 4.786 0 0 1 4.786 4.786v1.108a.5.5 0 0 0 .159.366l.713.666a1.3 1.3 0 0 1 .414.95V11.5a.5.5 0 0 1-.5.5H2.5a.5.5 0 0 1-.5-.5v-1.437c0-.501.25-.97.668-1.248l.395-.262a.5.5 0 0 0 .223-.416v-1.35A4.786 4.786 0 0 1 8.071 2m0 1a3.786 3.786 0 0 0-3.785 3.786v1.35c0 .502-.25.97-.668 1.249l-.395.262a.5.5 0 0 0-.223.416V11h10.143V9.876a.3.3 0 0 0-.095-.219l-.714-.667a1.5 1.5 0 0 1-.477-1.096V6.786A3.786 3.786 0 0 0 8.071 3" clip-rule="evenodd"/></g></svg>',
  };

  static LOGO_ICON = '<svg width="24" height="24" viewBox="0 0 16 16" fill="none" stroke="none" xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd" clip-path="url(#sf-logo-c)" clip-rule="evenodd"><path fill="#29B5E8" d="m8.58 8.118-.49.49a.167.167 0 0 1-.237 0l-.49-.49a.167.167 0 0 1 0-.236l.49-.49a.167.167 0 0 1 .237 0l.49.49a.167.167 0 0 1 0 .236m1.024-.616L8.47 6.367a.705.705 0 0 0-.997 0L6.34 7.502a.705.705 0 0 0 0 .996l1.134 1.135a.705.705 0 0 0 .997 0l1.134-1.135a.705.705 0 0 0 0-.996M6.086 0c-.558 0-1.011.453-1.011 1.012v2.094L3.247 2.051a1.011 1.011 0 0 0-1.011 1.752l3.208 1.852a1.012 1.012 0 0 0 1.653-.782v-3.86A1.01 1.01 0 0 0 6.088 0m-.797 8.384A1 1 0 0 0 5.367 8a1 1 0 0 0-.076-.384l-.019-.043-.027-.054-.013-.025-.006-.009-.035-.055-.02-.03-.038-.047-.027-.031q-.016-.02-.035-.037l-.036-.035q-.015-.014-.032-.026l-.047-.038-.03-.02-.055-.036-.009-.006-3.345-1.931A1.011 1.011 0 1 0 .506 6.945L2.333 8 .506 9.055a1.011 1.011 0 1 0 1.011 1.752l3.345-1.931.01-.006q.027-.016.054-.036l.03-.02.047-.038.032-.026.036-.035.035-.037.027-.031q.02-.023.038-.048l.02-.029.036-.055.005-.01.013-.024.027-.054zm.795 1.731c-.243 0-.467.086-.642.23l-3.208 1.852a1.011 1.011 0 0 0 1.011 1.752l1.828-1.055v2.095a1.011 1.011 0 0 0 2.023 0v-3.863c0-.558-.453-1.011-1.012-1.011m7.621 2.082-3.209-1.852a1.012 1.012 0 0 0-1.653.782v3.862a1.011 1.011 0 0 0 2.023 0v-2.095l1.827 1.055a1.011 1.011 0 1 0 1.012-1.752m1.73-3.142L13.609 8l1.828-1.055a1.012 1.012 0 1 0-1.012-1.752l-3.344 1.931-.01.006-.055.036-.029.02-.047.038-.032.026-.036.035-.036.037-.026.031q-.02.023-.038.048l-.02.029-.036.055-.006.01-.012.024a1 1 0 0 0-.08.195q-.008.02-.012.04a1 1 0 0 0 0 .492l.011.04a1 1 0 0 0 .08.195l.013.025.006.009q.017.028.036.055l.02.03.038.047.026.031.036.037.036.035q.015.014.032.026.022.02.047.038l.03.02q.027.02.055.036l.009.006 3.344 1.931a1.011 1.011 0 1 0 1.012-1.752m-1.36-6.634a1.01 1.01 0 0 0-1.382-.37l-1.827 1.055V1.012a1.011 1.011 0 1 0-2.023 0v3.862a1.011 1.011 0 0 0 1.653.781l3.209-1.852c.484-.28.65-.898.37-1.382"/></g><defs><clipPath id="sf-logo-c"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>';

  static LOGO_WORDMARK = '<svg width="105" height="24" viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#sf-wm-c)"><path fill-rule="evenodd" clip-rule="evenodd" d="M40.7468 9.97503C41.5392 9.97503 42.5345 10.3734 43.3217 10.9526C44.1239 11.5429 44.5045 12.1694 44.1131 12.5128C44.0536 12.565 43.9924 12.6024 43.9285 12.6249C43.741 12.691 43.5626 12.6314 43.3266 12.4621C43.2519 12.4085 42.8098 12.0495 42.656 11.9391C42.0496 11.5038 41.4187 11.2711 40.5794 11.2711C40.0665 11.2711 39.4222 11.4385 38.9279 11.728C38.3329 12.0765 37.9925 12.5645 37.9925 13.1728C37.9925 13.5865 38.2121 13.9042 38.6554 14.1791C39.0114 14.3998 39.4122 14.5549 40.2521 14.8264C40.2454 14.8242 40.4464 14.8891 40.503 14.9074C40.6108 14.9424 40.6989 14.9713 40.7832 14.9994C40.8634 15.0262 40.9445 15.0531 41.0555 15.0898C41.0852 15.0995 41.1235 15.1122 41.1913 15.1345C41.2453 15.1524 41.2865 15.166 41.3265 15.1792C42.5983 15.6003 43.2233 15.864 43.7785 16.2796C44.5005 16.8201 44.8714 17.5288 44.8714 18.5019C44.8714 19.4984 44.3953 20.4008 43.5591 21.0339C42.7424 21.6341 41.7715 21.9147 40.5725 21.9147C39.7849 21.9047 38.7947 21.6896 38.0804 21.3522C37.4497 21.0543 36.9959 20.7638 36.7454 20.4866C36.4516 20.1616 36.4286 19.8347 36.7155 19.5652C36.8864 19.4046 37.079 19.4106 37.3501 19.5416C37.4373 19.5837 37.9864 19.902 38.1899 20.0033C38.8827 20.3482 39.623 20.5377 40.5739 20.5377C41.1018 20.5377 41.7939 20.378 42.3252 20.0923C43.0009 19.7289 43.3834 19.2004 43.3761 18.5031C43.3709 18.0007 43.0833 17.6029 42.5277 17.2596C42.1006 16.9956 41.6643 16.8235 40.7103 16.5043C40.6991 16.5005 40.6877 16.4967 40.676 16.4929C40.615 16.473 39.3467 16.1166 38.9215 15.9644C37.3251 15.3931 36.4558 14.5597 36.4953 13.1695C36.5284 12.0041 36.9125 11.3674 37.8123 10.7472C38.5414 10.2446 39.5532 9.97503 40.7468 9.97503ZM48.2196 21.6579C48.1048 21.8227 47.9091 21.9147 47.7 21.9147H47.5405L47.525 21.9103C47.3347 21.8559 47.1683 21.7228 47.079 21.5556C47.0489 21.5204 47.0383 21.4862 47.0358 21.4418L47.0112 21.4172V10.6874C47.0112 10.3055 47.3093 9.99893 47.7 9.99893C48.0715 9.99893 48.3649 10.31 48.3649 10.6874V11.5094C49.2686 10.5595 50.538 9.99893 51.8844 9.99893C54.57 9.99893 56.7577 12.193 56.7577 14.8695V21.2262C56.7577 21.6169 56.4509 21.9147 56.0689 21.9147C55.6868 21.9147 55.3801 21.6169 55.3801 21.2262V14.8695C55.3801 12.9411 53.8211 11.3759 51.8844 11.3759C49.9748 11.3759 48.4115 12.9383 48.3649 14.8695V21.336L48.3624 21.3459L48.3615 21.3497C48.322 21.5075 48.2933 21.5814 48.2196 21.6579ZM64.2997 9.97503C67.4243 9.97503 69.962 12.6779 69.962 15.9449C69.962 19.2119 67.4243 21.9147 64.2997 21.9147C61.1909 21.9147 58.6375 19.2032 58.6375 15.9449C58.6375 12.6866 61.1909 9.97503 64.2997 9.97503ZM93.6903 6.39544C93.668 6.39787 93.6452 6.39929 93.6204 6.39969C92.9031 6.3947 92.4783 6.53073 92.2372 6.80047C91.965 7.12004 91.7981 7.7278 91.7865 8.6745V9.80959L93.3225 9.80967C93.717 9.79451 94.0408 10.1046 94.0304 10.4732C94.0402 10.8748 93.7347 11.1938 93.3269 11.216H91.7864L91.7864 21.2436C91.8021 21.6288 91.4935 21.9515 91.1197 21.9515C90.7156 21.9515 90.4 21.6356 90.4162 21.2483V11.216L88.9797 11.2158C88.5872 11.1937 88.2826 10.8758 88.2826 10.476C88.2826 10.1032 88.605 9.79448 88.9861 9.80958H90.4162V8.67352C90.4274 7.35947 90.6565 6.50185 91.2169 5.87847C91.7463 5.26914 92.572 4.99331 93.6212 4.99331C93.6459 4.99331 93.6705 4.99458 93.6949 4.9971C93.7191 4.99458 93.7436 4.99331 93.7682 4.99331H93.9528C94.3407 4.99331 94.6558 5.30828 94.6557 5.69852L94.6553 5.72161C94.642 6.0989 94.3317 6.39969 93.9533 6.39969H93.7679C93.7418 6.39969 93.716 6.39826 93.6903 6.39544ZM78.8654 15.2381L76.2605 21.4588L76.2517 21.4676L76.2483 21.4777C76.1645 21.7291 75.8903 21.9147 75.6372 21.9147C75.5639 21.9147 75.51 21.902 75.4007 21.866C75.3661 21.863 75.3345 21.8527 75.3061 21.8356C75.2886 21.8251 75.2767 21.8159 75.2614 21.8014C75.1302 21.7417 75.0405 21.634 74.9795 21.4814L71.0597 10.9449C70.9186 10.6064 71.0801 10.2029 71.4086 10.0537C71.7583 9.90808 72.1866 10.0849 72.3019 10.4308L75.6204 19.4549L78.2102 13.2933C78.3217 13.0424 78.5981 12.8666 78.8651 12.8666C79.1521 12.8666 79.4308 13.0387 79.545 13.2955L82.1334 19.454L85.4283 10.4311L85.4302 10.4263C85.5732 10.0832 85.9994 9.90725 86.3217 10.0537C86.6681 10.198 86.8381 10.6003 86.6961 10.9407L82.7976 21.4362C82.7421 21.5749 82.6575 21.6877 82.5446 21.7723C82.4157 21.8689 82.2978 21.9147 82.1409 21.9147H82.0692L82.055 21.9138C81.8057 21.8827 81.5638 21.6993 81.485 21.462L78.8654 15.2381ZM97.3814 4.95654C97.7751 4.95654 98.0941 5.26648 98.0941 5.64503V21.2262C98.0941 21.6048 97.7751 21.9147 97.3814 21.9147C97.0071 21.9147 96.6926 21.6004 96.6926 21.2262V5.64503C96.6926 5.27086 97.0071 4.95654 97.3814 4.95654ZM110.061 19.8198C108.996 21.1268 107.436 21.9147 105.776 21.9147C102.644 21.9147 100.114 19.2276 100.114 15.9449C100.114 12.6622 102.644 9.97503 105.776 9.97503C107.444 9.97503 109.001 10.7496 110.061 12.0464V10.6635C110.061 10.2729 110.367 9.97503 110.749 9.97503C111.131 9.97503 111.438 10.2729 111.438 10.6635V21.2262C111.438 21.6004 111.124 21.9147 110.749 21.9147C110.375 21.9147 110.061 21.6004 110.061 21.2262V19.8198ZM64.2997 11.3281C61.9633 11.3281 60.0151 13.4133 60.0151 15.9449C60.0151 18.4719 61.9588 20.5377 64.2997 20.5377C66.6406 20.5377 68.5844 18.4719 68.5844 15.9449C68.5844 13.4133 66.6362 11.3281 64.2997 11.3281ZM115.253 16.6282L121.991 10.0601C122.275 9.77631 122.682 9.77631 122.962 10.056C123.251 10.3161 123.251 10.7507 122.965 11.0366L118.522 15.3324L122.998 20.7711C123.249 21.0781 123.225 21.4794 122.942 21.7616L122.933 21.7701C122.805 21.8725 122.65 21.9147 122.479 21.9147C122.241 21.9147 122.04 21.8343 121.93 21.6509L117.521 16.3304L115.253 18.5973V21.2262C115.253 21.6048 114.934 21.9147 114.54 21.9147C114.166 21.9147 113.851 21.6004 113.851 21.2262V5.64503C113.851 5.27086 114.166 4.95654 114.54 4.95654C114.934 4.95654 115.253 5.26648 115.253 5.64503V16.6282ZM125.325 16.2749C125.495 18.6798 127.392 20.518 129.708 20.5376C129.713 20.5376 129.814 20.5377 129.972 20.5377L130.261 20.5377C131.681 20.5377 133.111 19.5903 133.939 18.2105C134.131 17.8828 134.553 17.7929 134.863 17.9787L134.871 17.9843C135.188 18.2144 135.288 18.6154 135.092 18.9509C133.977 20.729 132.156 21.9147 130.261 21.9147C130.209 21.9147 130.14 21.9147 130.056 21.9147C129.923 21.9147 129.817 21.9146 129.757 21.9146L129.703 21.9146C126.512 21.8913 123.94 19.2287 123.94 15.9688C123.94 12.6525 126.529 9.97503 129.746 9.97503C132.794 9.97503 135.258 12.3854 135.504 15.5625V15.6342C135.504 16.0028 135.196 16.2749 134.815 16.2749H125.325ZM105.776 11.3281C103.432 11.3281 101.491 13.3976 101.491 15.9449C101.491 18.4875 103.427 20.5377 105.776 20.5377C108.14 20.5377 110.061 18.4963 110.061 15.9449C110.061 13.3888 108.136 11.3281 105.776 11.3281ZM125.416 14.9218H134.007C133.583 12.851 131.801 11.352 129.746 11.352C127.652 11.352 125.884 12.8201 125.416 14.9218Z" fill="#29B5E8" stroke="#29B5E8" stroke-width="0.5"/></g><defs><clipPath id="sf-wm-c"><rect width="135.54" height="32" fill="white"/></clipPath></defs></svg>';

  static DEFAULT_SECTIONS = [
    {
      title: "Work with data",
      items: [
        { id: "projects", label: "Projects", icon: "projects" },
        { id: "ingestion", label: "Ingestion", icon: "ingestion" },
        { id: "transformation", label: "Transformation", icon: "transformation" },
        { id: "ai-ml", label: "AI & ML", icon: "ai-ml" },
        { id: "monitoring", label: "Monitoring", icon: "monitoring" },
        { id: "marketplace", label: "Marketplace", icon: "marketplace" },
      ],
    },
    {
      title: "Horizon Catalog",
      items: [
        { id: "catalog", label: "Catalog", icon: "catalog" },
        { id: "data-sharing", label: "Data sharing", icon: "data-sharing" },
        { id: "governance", label: "Governance & security", icon: "governance" },
      ],
    },
    {
      title: "Manage",
      items: [
        { id: "compute", label: "Compute", icon: "compute" },
        { id: "postgres", label: "Postgres", icon: "postgres" },
        { id: "admin", label: "Admin", icon: "admin" },
      ],
    },
  ];

  constructor(element) {
    this.root = element;
    this.root.classList.add("stellar-globalnav");
    this.collapsed = element.dataset.collapsed === "true";
    this.activeItem = element.dataset.active || "projects";

    if (this.collapsed) {
      this.root.classList.add("stellar-globalnav--collapsed");
    }

    this._render();

    this.root.addEventListener("click", (e) => {
      const collapseBtn = e.target.closest("[data-action='toggle-collapse']");
      if (collapseBtn) {
        this.toggleCollapse();
        return;
      }

      const navItem = e.target.closest("[data-nav-id]");
      if (navItem) {
        this.setActive(navItem.dataset.navId);
        return;
      }
    });
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
    this.root.classList.toggle("stellar-globalnav--collapsed", this.collapsed);
    this._render();
  }

  setActive(id) {
    this.activeItem = id;
    this._updateActiveState();
    this.root.dispatchEvent(
      new CustomEvent("globalnav-change", {
        detail: { activeItem: id },
        bubbles: true,
      })
    );
  }

  _updateActiveState() {
    this.root.querySelectorAll("[data-nav-id]").forEach((btn) => {
      const isActive = btn.dataset.navId === this.activeItem;
      btn.classList.toggle("stellar-globalnav__nav-item--active", isActive);
    });
  }

  _icon(key) {
    return StellarGlobalNav.SVG[key] || "";
  }

  _render() {
    const sections = JSON.parse(this.root.dataset.sections || "null") || StellarGlobalNav.DEFAULT_SECTIONS;
    const user = JSON.parse(this.root.dataset.user || "null") || {
      name: "Danny Banks",
      role: "PUBLIC",
      hasNotifications: false,
    };
    const initials =
      user.initials ||
      user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);

    this.root.innerHTML = this.collapsed
      ? this._renderCollapsed(sections, user, initials)
      : this._renderExpanded(sections, user, initials);

    this._updateActiveState();
  }

  _renderExpanded(sections, user, initials) {
    const sectionHtml = sections
      .map(
        (s) => `
      <div class="stellar-globalnav__section">
        <h3 class="stellar-globalnav__section-title">${s.title}</h3>
        <ul class="stellar-globalnav__nav-list">
          ${s.items
            .map(
              (item) => `
            <li>
              <button class="stellar-globalnav__nav-item" data-nav-id="${item.id}">
                <span class="stellar-globalnav__nav-icon">${this._icon(item.icon)}</span>
                <span class="stellar-globalnav__nav-label">${item.label}</span>
              </button>
            </li>`
            )
            .join("")}
        </ul>
      </div>`
      )
      .join("");

    return `
      <div class="stellar-globalnav__header">
        <div class="stellar-globalnav__logo">
          ${StellarGlobalNav.LOGO_ICON}
          <span class="stellar-globalnav__logo-wordmark">${StellarGlobalNav.LOGO_WORDMARK}</span>
        </div>
        <button class="stellar-globalnav__icon-btn" data-action="toggle-collapse" aria-label="Collapse sidebar">
          ${this._icon("collapse")}
        </button>
      </div>
      <div class="stellar-globalnav__actions">
        <button class="stellar-globalnav__action-btn" data-action="home" aria-label="Home">${this._icon("home")}</button>
        <button class="stellar-globalnav__action-btn" data-action="create" aria-label="Create new">${this._icon("create")}</button>
        <button class="stellar-globalnav__action-btn" data-action="search" aria-label="Search">${this._icon("search")}</button>
      </div>
      <div class="stellar-globalnav__divider"></div>
      <nav class="stellar-globalnav__nav">${sectionHtml}</nav>
      <div class="stellar-globalnav__footer">
        <div class="stellar-globalnav__profile">
          <div class="stellar-globalnav__profile-left">
            <div class="stellar-globalnav__avatar">${initials}</div>
            <div class="stellar-globalnav__user-info">
              <span class="stellar-globalnav__user-name">${user.name}</span>
              <span class="stellar-globalnav__user-role">${user.role}</span>
            </div>
          </div>
          <div class="stellar-globalnav__profile-right">
            <div class="stellar-globalnav__profile-divider"></div>
            <button class="stellar-globalnav__notification-btn" aria-label="Notifications">
              ${this._icon("notifications")}
              ${user.hasNotifications ? '<span class="stellar-globalnav__notification-badge"></span>' : ""}
            </button>
          </div>
        </div>
      </div>`;
  }

  _renderCollapsed(sections, user, initials) {
    const sectionHtml = sections
      .map(
        (s, i) => `
      <div class="stellar-globalnav__section">
        ${i > 0 ? '<div class="stellar-globalnav__divider stellar-globalnav__divider--compact"></div>' : ""}
        <ul class="stellar-globalnav__nav-list">
          ${s.items
            .map(
              (item) => `
            <li>
              <div class="stellar-globalnav__tooltip-wrap" data-tooltip="${item.label}">
                <button class="stellar-globalnav__nav-item stellar-globalnav__nav-item--collapsed" data-nav-id="${item.id}">
                  <span class="stellar-globalnav__nav-icon">${this._icon(item.icon)}</span>
                  <span class="stellar-globalnav__nav-label">${item.label}</span>
                </button>
              </div>
            </li>`
            )
            .join("")}
        </ul>
      </div>`
      )
      .join("");

    return `
      <div class="stellar-globalnav__header">
        <div class="stellar-globalnav__logo">
          ${StellarGlobalNav.LOGO_ICON}
          <span class="stellar-globalnav__logo-wordmark">${StellarGlobalNav.LOGO_WORDMARK}</span>
        </div>
      </div>
      <div class="stellar-globalnav__actions stellar-globalnav__actions--collapsed">
        <div class="stellar-globalnav__tooltip-wrap" data-tooltip="Expand sidebar">
          <button class="stellar-globalnav__action-btn" data-action="toggle-collapse" aria-label="Expand sidebar">
            ${this._icon("expand")}
          </button>
        </div>
        <div class="stellar-globalnav__divider stellar-globalnav__divider--compact"></div>
        <div class="stellar-globalnav__tooltip-wrap" data-tooltip="Home">
          <button class="stellar-globalnav__action-btn" data-action="home" aria-label="Home">${this._icon("home")}</button>
        </div>
        <div class="stellar-globalnav__tooltip-wrap" data-tooltip="Create new">
          <button class="stellar-globalnav__action-btn" data-action="create" aria-label="Create new">${this._icon("create")}</button>
        </div>
        <div class="stellar-globalnav__tooltip-wrap" data-tooltip="Search">
          <button class="stellar-globalnav__action-btn" data-action="search" aria-label="Search">${this._icon("search")}</button>
        </div>
      </div>
      <div class="stellar-globalnav__divider"></div>
      <nav class="stellar-globalnav__nav">${sectionHtml}</nav>
      <div class="stellar-globalnav__footer stellar-globalnav__footer--collapsed">
        <div class="stellar-globalnav__tooltip-wrap" data-tooltip="Notifications">
          <button class="stellar-globalnav__notification-btn" aria-label="Notifications">
            ${this._icon("notifications")}
            ${user.hasNotifications ? '<span class="stellar-globalnav__notification-badge"></span>' : ""}
          </button>
        </div>
        <div class="stellar-globalnav__tooltip-wrap" data-tooltip="${user.name}">
          <div class="stellar-globalnav__avatar">${initials}</div>
        </div>
      </div>`;
  }
}

function _initGlobalNav() {
  document.querySelectorAll('[data-component="globalnav"]').forEach((el) => {
    if (!el._stellarGlobalNav) {
      el._stellarGlobalNav = new StellarGlobalNav(el);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _initGlobalNav);
} else {
  _initGlobalNav();
}
