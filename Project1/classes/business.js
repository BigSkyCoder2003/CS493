class Business {
  constructor(
    name,
    street_addr,
    city,
    state,
    zip,
    phone_num,
    category,
    subcategory,
    website,
    email
  ) {
    this.name = name;
    this.street_addr = street_addr;
    this.city = city;
    this.state = state;
    this.zip = zip;
    this.phone_num = phone_num;
    this.category = category;
    this.subcategory = subcategory;
    this.website = website;
    this.email = email;

    reviews = []
  }

  toJSON() {
    return {
      name: this.name,
      street_addr: this.street_addr,
      city: this.city,
      state: this.state,
      zip: this.zip,
      phone_num: this.phone_num,
      category: this.category,
      subcategory: this.subcategory,
      website: this.website,
      email: this.email,
    };
  }

  static fromJSON(json) {
    return new Business(
      json.name,
      json.street_addr,
      json.city,
      json.state,
      json.zip,
      json.phone_num,
      json.category,
      json.subcategory,
      json.website,
      json.email
    );
  }

  validate() {
    if (!this.name || !this.street_addr || !this.city || !this.state || !this.zip || !this.phone_num) {
      return false;
    }
    // Add more validation logic as needed
    return true;
  }
}