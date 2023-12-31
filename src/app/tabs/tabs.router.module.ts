import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule),
          },
        ],
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule),
          },
          {
            path: 'map',
            loadChildren: () => import('../tab2/map-leaflet/map-leaflet.module').then(m => m.LocationMapPageModule),
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
            loadChildren: () => import('../tab3/settings/settings.module').then(m => m.SettingsPageModule),
          },
          {
            path: 'infos',
            loadChildren: () => import('../tab3/informations/informations.module').then(m => m.InformationsPageModule),
            data: {
              infos: true,
            },
          },
          {
            path: 'helpcenter',
            loadChildren: () => import('../tab3/informations/informations.module').then(m => m.InformationsPageModule),
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
