<p align="center">
<a href="https://github.com/datakind/sst-app-ui/actions"><img src="https://github.com/datakind/sst-app-ui/actions/workflows/laravel.yml/badge.svg" alt="Build Status"></a>
</p>

## About the Student Success Tool


## Frameworks Used

the Student Success Tool is built on:

* Laravel Framework. [Documentation](https://laravel.com/docs)

* Inertiajs. [Documentation](https://inertiajs.com)

* Reactjs. [Documentation](https://reactjs.org/docs/getting-started.html)

* Tailwindcss. [Documentation](https://v2.tailwindcss.com/docs)

## Local Development


1. Clone this project
2. <code>cd [project-name]</code>
3. <code>composer install</code>
4. Copy <code>.env.example</code> file to <code>.env</code> on the root folder.
5. Open your <code>.env</code> file. Update DB_ and DK_API_SUITE_ credentials.
6. <code>./vendor/bin/sail artisan key:generate</code>
7. <code>./vendor/bin/sail artisan migrate</code>
8. <code>./vendor/bin/sail artisan serve</code>
9. <code>docker exec -it [your-project-container] /bin/sh</code>
10. Change to user sail <code>su sail</code>
11. Run <code>php artisan storage:link</code> and exit twice to get out of the container.
12. Go to http://localhost/

## Contributing

### Setup (one-time)
1. `brew install composer` (Assuming you are on Mac, but install as you think best)
2. Check out git repo [sst-app-ui](https://github.com/datakind/sst-app-ui). You likely will want to check out the develop branch with `git checkout develop`
3. cd into repo top folder you just checked out
4. `composer install`
5. Find 'sst-app-ui.env' in LastPass and save contents to .env
6. Start sail: `./vendor/bin/sail up -d`
7. `./vendor/bin/sail artisan key:generate`
8. `./vendor/bin/sail artisan migrate`
9. `docker exec -it [your-project-container] /bin/sh` where you container will be something like `sst-app-ui-laravel.test-1`
10. `su sail`
11. `php artisan storage:link`
12. `npm install`
13. CTRL-D twice to exit
14. Stop sail: `./vendor/bin/sail stop`

### To run the environment:
1. Start sail: `./vendor/bin/sail up -d`
2. In one terminal window start artisan: `./vendor/bin/sail artisan serve`
3. In another terminal: `docker exec -it [your-project-container] /bin/sh`
4. `npm run dev`
5. Go to http://localhost/
6. If you don't have an account, register
7. Login





