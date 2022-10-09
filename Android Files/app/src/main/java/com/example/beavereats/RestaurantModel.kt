package com.example.beavereats

import java.util.*

class RestaurantModel {
    // Properties
    var location: String = ""
    var hourStart: String = ""
    var hourStop: String = ""
    var status: String = ""

    constructor(location: String, hourStart: String, hourStop: String, status: String) {
        this.location = location
        this.hourStart = hourStart
        this.hourStop = hourStop
        this.status = status
    }

    // Empty constructor
    constructor()
}