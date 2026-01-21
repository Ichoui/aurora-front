import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

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
            loadComponent: () => import('../tab3/informations/informations.page').then(m => m.InformationsPage),
            data: {
              infos: true,
            },
          },
          {
            path: 'helpcenter',
            loadComponent: () => import('../tab3/informations/informations.page').then(m => m.InformationsPage),
            data: {
              helpcenter: true,
            },
          },
        ],
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
