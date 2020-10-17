import groq from "groq";
import { stripIndent } from "common-tags";

/**
 * Put all queries indented on newline, test suite will
 * strip extra indentation
 *
 * modifications
 * - Added spaces around _all_ objects
 * - Removed trailing commas
 */
export const constraints = [
  groq`
    *
  `,
  groq`
    *[]
  `,
  groq`
    *[_type == "movie"]
  `,
  groq`
    *[_id == "abc.123"]
  `,
  groq`
    *[_type in ["movie", "person"]]
  `,
  groq`
    *[_type == "movie" && popularity > 15 && releaseDate > "2016-04-25"]
  `,
  groq`
    *[_type == "movie" && (popularity > 15 || releaseDate > "2016-04-25")]
  `,
  groq`
    *[popularity < 15]
  `,
  groq`
    *[popularity > 15]
  `,
  groq`
    *[popularity <= 15]
  `,
  groq`
    *[popularity >= 15]
  `,
  groq`
    *[popularity == 15]
  `,
  groq`
    *[releaseDate != "2016-04-27"]
  `,
  groq`
    *[!(releaseDate == "2016-04-27")]
  `,
  groq`
    *[!(releaseDate != "2016-04-27")]
  `,
  groq`
    *[_updatedAt > "2018-04-20T20:43:31Z"]
  `,
  groq`
    *[name < "Baker"]
  `,
  groq`
    *[awardWinner == true]
  `,
  groq`
    *[awardWinner]
  `,
  groq`
    *[!awardWinner]
  `,
  groq`
    *[defined(awardWinner)]
  `,
  groq`
    *[!defined(awardWinner)]
  `,
  groq`
    *[title == "Aliens"]
  `,
  groq`
    *[title in ["Aliens", "Interstellar", "Passengers"]]
  `,
  groq`
    *[_id in path("a.b.c.*")]
  `,
  groq`
    *[_id in path("a.b.c.**")]
  `,
  groq`
    *[!(_id in path("drafts.**"))]
  `,
  groq`
    *["yolo" in tags]
  `,
  groq`
    *[status in ["completed", "archived"]]
  `,
  groq`
    *[text match "word"]
  `,
  groq`
    *[title match "wo*"]
  `,
  groq`
    *[[title, body] match ["wo*", "zero"]]
  `,
  groq`
    *[body[].children[].text match "aliens"]
  `,
  groq`
    *[castMembers[].person._ref == "person_sigourney-weaver"]
  `,
  groq`
    *[slug.current == "some-slug"]
  `,
];

export const sliceOps = [
  groq`
    *[_type == "movie"][0]
  `,
  groq`
    *[_type == "movie"][0..5]
  `,
  groq`
    *[_type == "movie"][0...5]
  `,
  groq`
    *[_type == "movie"] { title }[0...10]
  `,
  groq`
    *[_type == "movie"][0...10] { title }
  `,
  groq`
    *[_type == "movie"][10...20] { title }
  `,
  groq`
    *[_type == "movie"]
  `,
];

export const ordering = [
  groq`
    *[_type == "movie"] | order(_createdAt asc)
  `,
  groq`
    *[_type == "movie"] | order(releaseDate desc) | order(_createdAt asc)
  `,
  groq`
    *[_type == "todo"] | order(priority desc, _updatedAt desc)
  `,
  groq`
    *[_type == "movie"] | order(_createdAt asc)[0]
  `,
  groq`
    *[_type == "movie"] | order(_createdAt desc)[0]
  `,
  groq`
    *[_type == "movie"] | order(_createdAt asc)[0..9]
  `,
  groq`
    *[_type == "movie"][0..9] | order(_createdAt asc)
  `,
  groq`
    *[_type == "movie"] | order(_createdAt asc)[$start..$end]
  `,
];

export const joins = [
  groq`
    *[_type == "movie"] {
      title,
      poster {
        asset->{ path, url }
      }
    }`,
  groq`
    *[_type == "movie"] { title,"cast": castMembers[].person->name }
  `,
  groq`
    *[_type == "movie"] { title,"cast": castMembers[].person-> { _id, name } }
  `,
  groq`
    *[_type == "person"] {
      name,
      "relatedMovies": *[_type == "movie" && references(^._id)] {
        title
      }
    }
  `,
  groq`
    *[
      _type == "book"
      && author._ref in *[_type == "author" && name == "John Doe"]._id
    ] { ... }
  `,
];

export const objectProjections = [
  groq`
    *[_type == "movie"] { title }
  `,
  groq`
    *[_type == "movie"] { _id, _type, title }
  `,
  groq`
    *[_type == "movie"] { "renamedId": _id, _type, title }
  `,
  groq`
    *[_type == "movie"].title
  `,
  groq`
    *[_type == "movie"] { "characterNames": castMembers[].characterName }
  `,
  groq`
    *[_type == "movie" && title == "Arrival"] {
      title,
      "posterUrl": poster.asset->url    }
  `,
  groq`
    *[_type == "movie"] { ... }
  `,
  groq`
    *[_type == "movie"] { "posterUrl": poster.asset->url, ... }
  `,
  groq`
    *[_type == "movie"] { ..., "rating": coalesce(rating, "unknown") }
  `,
  groq`
    *[_type == "movie"] { "actorCount": count(actors) }
  `,
  groq`
    *[_type == "movie"] { castMembers[] { characterName, person } }
  `,
  groq`
    *[_type == "movie"] {
      castMembers[characterName match "Ripley"] {
        characterName,
        person
      }
    }
  `,
  groq`
    *[_type == "book"] { authors[]->{ name, bio } }
  `,
  groq`
    { "threeMovieTitles": *[_type == "movie"][0..2].title }
  `,
  groq`
    {
      "featuredMovie": *[_type == "movie" && title == "Alien"][0],
      "scifiMovies": *[_type == "movie" && "sci-fi" in genres]
    }
  `,
];

export const specialVars = [
  groq`
    *
  `,
  groq`
    *[@["1"]]
  `,
  groq`
    *[@[$prop]._ref == $refId]
  `,
  groq`
    *{
      "arraySizes": arrays[] {
        "size": count(@)
      }
    }
  `,
  groq`
    *[_type == "person"] {
      name,
      "relatedMovies": *[_type == "movie" && references(^._id)] {
        title
      }
    }
  `,
];

export const conditionals = [
  groq`
    *[_type == "group_core"] {
      ...,
      "popularity": select(
        popularity > 20 => "high",
        popularity > 10 => "medium",
        popularity <= 10 => "low"
      )
    }
  `,
  groq`
    *[_type == "movie"] {
      ...,
      "popularity": select(
        popularity > 20 => "high",
        popularity > 10 => "medium",
        "low"
      )
    }
  `,
  groq`
    *[_type == "movie"] {
      ...,
      releaseDate >= "2018-06-01" => {
        "screenings": *[_type == "screening" && movie._ref == ^._id],
        "news": *[_type == "news" && movie._ref == ^._id]
      },
      popularity > 20 && rating > 7 => {
        "featured": true,
        "awards": *[_type == "award" && movie._ref == ^._id]
      }
    }
  `,

  groq`
    *[_type == "movie"] {
      ...,
      ...select(releaseDate >= "2018-06-01" => {
        "screenings": *[_type == "screening" && movie._ref == ^._id],
        "news": *[_type == "news" && movie._ref == ^._id]
      }),
      ...select(popularity > 20 && rating > 7 => {
        "featured": true,
        "awards": *[_type == "award" && movie._ref == ^._id]
      })
    }
  `,

  groq`
    content[] {
      _type == "type1" => {
      },
      _type == "type2" => {
      }
    }
  `,
];

export const functions = [
  groq`
    *[references("person_sigourney-weaver")] { title }
  `,
  groq`
    *[_type == "movie" && references(*[_type == "person" && age > 99]._id)]{ title }
  `,
  groq`
    *[defined(tags)]
  `,
  groq`
    *{ "title": coalesce(title.fi, title.en) }
  `,
  groq`count(*[_type == "movie" && rating == "R"])`,
  groq`
    *[_type == "movie"] {
      title,
      "actorCount": count(actors)
    }
  `,
  groq`
    round(3.14)
  `,
  groq`
    round(3.14, 1)
  `,
];

export const arithmeticAndConcatenation = [
  groq`
    1 + 2
  `,
  groq`
    3 - 2
  `,
  groq`
    2 * 3
  `,
  groq`
    8 / 4
  `,
  groq`
    2 ** 4
  `,
  groq`
    8 % 3
  `,
  groq`
    9 ** (1 / 2)
  `,
  groq`
    27 ** (1 / 3)
  `,
  groq`
    "abc" + "def"
  `,
  groq`
    [1, 2] + [3, 4]
  `,
  groq`
    { "a": 1, "b": 2 } + { "c": 3 }
  `,
];
