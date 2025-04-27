<script>
  import { RouterView } from '@dvcol/svelte-simple-router/components';
  import { RouterContext } from '@dvcol/svelte-simple-router/components';
  import './app.css';

  import Home from '@/pages/Home.svelte';

  import { router } from './router';

  let state = { fullscreen: false };

  const RouteName = {
    Home: 'home',
    Any: 'any'
  };

  const routes = [
    {
      name: RouteName.Home,
      path: '/',
      component: Home
    },
    {
      name: RouteName.Any,
      path: '*',
      redirect: {
        name: RouteName.Home
      }
    }
  ];

  const options = {
    routes,
    router
  };
</script>

<RouterContext {options}>
  <RouterView {router}></RouterView>
</RouterContext>
