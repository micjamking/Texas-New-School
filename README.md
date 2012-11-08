# #texasnewschool
*HTML5 Web app using Backbone.js & Instagram API*

*Work-In-Progress*

## Issues

This is a pretty simple but functional proof of concept. The main issue is that
the OAuth access token is not persisted server side so if you clean out your
browser you'll lose access with that particular token. You can reauthenticate
and get a new token, of course.

## ToDo

I'd like to use `http://parse.com` to persist access tokens and maybe provide
some kind of simple gallery hosting where users could quickly register and see
their Instagram galleries.
