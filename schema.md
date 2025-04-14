<!-- BUSINESSES -->
POST /businesses
{
  ---Req---
  "business_name": string,
  "street_address": string,
  "city": string,
  "state": string,
  "zip": int,
  "phone_number": string,
  "category": string,
  "subcategory": string
  ---Req---

  ---Opt---
  "website": string,
  "email": string
  ---Opt---
}

PATCH /businesses/:name
{
  ---Opt---
  "business_name": string,
  "street_address": string,
  "city": string,
  "state": string,
  "zip": int,
  "phone_number": string,
  "category": string,
  "subcategory": string,
  "website": string,
  "email": string
  ---Opt---
}

DELETE /businesses/:name

GET /businesses/
[
  {
    "business_name": string,
    "street_address": string,
    "city": string,
    "state": string,
    "zip": int,
    "phone_number": string,
    "category": string,
    "subcategory": string,
    "website": string,
    "email": string
  }
]

GET /businesses/:name
{
  "business_name": string,
  "street_address": string,
  "city": string,
  "state": string,
  "zip": int,
  "phone_number": string,
  "category": string,
  "subcategory": string,
  "website": string,
  "email": string,
  "reviews": [ ... ],
  "photos": [ ... ]
}
<!-- BUSINESSES -->

<!-- REVIEWS -->
POST /reviews
{
  ---Req---
  "business_name": string,
  "star": int (0-5),
  "dollar_sign_rating": int (1-4)
  ---Req---

  ---Opt---
  "review": string
  ---Opt---
}

PATCH /reviews/:review_id
{
  ---Opt---
  "star": int (0-5),
  "dollar_sign_rating": int (1-4),
  "review": string
  ---Opt---
}

DELETE /reviews/:review_id

GET /reviews/
[
  {
    "business_name": string,
    "star": int (0-5),
    "dollar_sign_rating": int (1-4),
    "review": string
  }
]
<!-- REVIEWS -->

<!-- PHOTOS -->
POST /photos
{
  ---Req---
  "business_name": string,
  "photo_file": file
  ---Req---

  ---Opt---
  "caption": string
  ---Opt---
}

PATCH /photos/:photo_id
{
  ---Opt---
  "caption": string
  ---Opt---
}

DELETE /photos/:photo_id

GET /photos/
[
  {
    "business_name": string,
    "photo_url": string,
    "caption": string
  }
]
<!-- PHOTOS -->