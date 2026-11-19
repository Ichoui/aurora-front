import type { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const loadInformation = () => import('../tab3/informations/informations.page').then(m => m.InformationsPage);

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadComponent: () => import('../tab1/tab1.page').then(m => m.Tab1Page),
          },
        ],
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadComponent: () => import('../tab2/tab2.page').then(m => m.Tab2Page),
          },
          {
            path: 'map',
            loadComponent: () => import('../tab2/map-leaflet/map-leaflet.page').then(m => m.MapLeafletPage),
          },
          { path: 'infos', loadComponent: loadInformation, data: { infos: true, backUrl: '/tabs/tab2' } },
          { path: 'helpcenter', loadComponent: loadInformation, data: { helpcenter: true, backUrl: '/tabs/tab2' } },
        ],
      },
      {
        path: 'tab3',
        children: [
          {
            path: '',
            redirectTo: '/tabs/tab3/settings',
            pathMatch: 'full',
          },
          {
            path: 'settings',
            loadComponent: () => import('../tab3/settings/settings.page').then(m => m.SettingsPage),
          },
          {
            path: 'infos',
            loadComponent: loadInformation,
            data: {
              infos: true,
            },
          },
          {
            path: 'helpcenter',
            loadComponent: loadInformation,
            data: {
              helpcenter: true,
            },
          },
        ],
      },
      {
        path: '',
        redirectTo: '/tabs/tab2',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab2',
    pathMatch: 'full',
  },
];
