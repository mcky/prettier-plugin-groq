<h1 align="center">Prettier for GROQ</h1>

`prettier-plugin-groq` is a [prettier](https://prettier.io/) plugin for formatting GROQ queries.

## Work in progress
The outputted queries are still considered unstable, it's still not smart enough to know when keep some queries as one-liners or to when to break. That said apart from stripping out comments it _shouldn't_ destructively modify any queries. It's been tested against sanity's [Query cheat sheet](https://www.sanity.io/docs/query-cheat-sheet) to verify `stripWhitespace(format(query)) === stripWhitespace(query)`.

## Examples

### 👍 handled
```patch
- *[_id=='foo'] | order(date asc) { _id, slug, 'title': name, foo { bar}  }
+ *[_id == "foo"] | order(date asc) {
+   _id,
+   slug,
+   "title": name,
+   foo { bar }
+ }
```

```patch
- *[] {
-     id,
-     title
- }
+ *[] { id, title }
```
```patch
- *[ _type match "foo*" && !( _id in path("drafts.**" ) ) ] |
- order(createdAt asc) {
-     "same": same,
-     "foo": {
-         bar,
-         "baz": { bing
-         }
-     },
-     "title": coalesce(
-       title.fi,
-       title.en.gb
-     ),
-     ...*[other != false],
-   member-> {
-     "profilePicture": profilePicture.asset-> { url }
-   },
-   body[]{
-     ..., markDefs[]{
-       ...,
-       _type == "person" => {"person": @.reference-> {name}}
-     }
-   },
- } [0..99]
+ *[_type match "foo*" && !(_id in path("drafts.**"))] | order(createdAt asc) {
+   same,
+   "foo": {
+     bar,
+     "baz": { bing }
+   },
+   "title": coalesce(title.fi, title.en.gb),
+   ...*[other != false],
+   member-> {
+     profilePicture.asset-> {
+       url
+     }
+   },
+   body[] {
+     ...,
+     markDefs[] {
+       ...,
+       _type == "person" => {
+         "person": @["reference"]-> {
+           name
+         }
+       }
+     }
+   }
+ }[0..99]
```

### 👎 in progress
Not splitting arrays/objects when it isn't needed
```patch
- *[_type in ["movie", "person"]]
+ *[_type in [
+   "movie",
+   "person"
+ ]]
```
```patch
- *[_type == "movie"] { _id, _type, title }
+ *[_type == "movie"] {
+   _id,
+   _type,
+   title
+ }
```
```patch
- *{ "title": coalesce(title.fi, title.en) }
+ * {
+   "title": coalesce(title.fi, title.en)
+ }
```
```patch
- [1, 2] + [3, 4]
+ [
+   1,
+   2
+ ] + [
+   3,
+   4
+ ]
```
```patch
- { "a": 1, "b": 2 } + { "c": 3 }
+ {
+   "a": 1,
+   "b": 2
+ } + { "c": 3 }
```


## Useful GROQ links:
* [groq spec](https://sanity-io.github.io/GROQ/)
* [How queries work (sanity docs)](https://www.sanity.io/docs/how-queries-work)
* [groq.dev](https://groq.dev/) - Run GROQ queries against JSON
