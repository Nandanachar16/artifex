
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/Artifex/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/Artifex/artifex",
    "route": "/Artifex"
  },
  {
    "renderMode": 2,
    "redirectTo": "/Artifex/artifex/home",
    "route": "/Artifex/artifex"
  },
  {
    "renderMode": 2,
    "route": "/Artifex/artifex/home"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 776, hash: '9fb8f72ce8a0e5f6c48a40b184670b7aa2ca43b51cf8dc384baaf6be2167328b', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1030, hash: '4a2a2f57c1969d37d9668b3bed34def5245f70144d27da472239b1e89e8d7e68', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'artifex/home/index.html': {size: 12855, hash: '1ab2f4cb8b367085fb4269ddc6bb368cfadda89a50e3fba7f4c56f95d81160e0', text: () => import('./assets-chunks/artifex_home_index_html.mjs').then(m => m.default)},
    'styles-7JXV4ULB.css': {size: 192, hash: 'Dkn7s4EMLQk', text: () => import('./assets-chunks/styles-7JXV4ULB_css.mjs').then(m => m.default)}
  },
};
