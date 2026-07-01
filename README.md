# liste
Most simple sharing of lists via links, where list items are encoded in the Hash Part of the URL and can be send around as links. No storage, no surveillance, so to say really serverless.

UI is in German and beautified with Bootstrap.

## Features

- no account, database, cookie, or server state
- robust URL-hash round-trips for spaces, umlauts, and separator characters
- bulk import from pasted lines without splitting valid semicolons inside items
- explicit remove buttons instead of accidental click-to-delete
- copy link, copy plain text, mail, sort, clear, count, and URL-length feedback

## Local checks

```sh
npm test
python3 -m http.server 4175
```

Developed as part of a introductory computer science lecture at Pforzheim University with Codesandbox.io online IDE, see [https://codesandbox.io/s/liste-9q5wr](https://codesandbox.io/s/liste-9q5wr)


# Questions, Feedback ?
You are welcome to contact me via my github account.
