package com.example.beavereats

import android.app.Activity
import android.content.Context
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.lifecycle.MutableLiveData
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.*
import org.json.JSONArray
import java.lang.Exception
import java.time.LocalTime
import kotlin.reflect.jvm.internal.impl.renderer.KeywordStringsGenerated

class MainActivity : AppCompatActivity() {

    private val loading = MutableLiveData<Boolean>().apply {
        value = false
    }
    private val showError = MutableLiveData<Boolean>().apply {
        value = false
    }
    private var sort = "name"

    private var viewModelJob = Job()
    private val coroutineScope = CoroutineScope(viewModelJob + Dispatchers.Main)
    private val TAG = MainActivity::class.java.simpleName
    private lateinit var context : Context
    private lateinit var recyclerView : RecyclerView
    private lateinit var popUpLayout : ConstraintLayout

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        recyclerView = findViewById<RecyclerView>(R.id.rvRestaurantList)
        popUpLayout = findViewById(R.id.popUpLayout)

        popUpVisibility(false)

        recyclerView.focusable = View.NOT_FOCUSABLE
        recyclerView.layoutManager = GridLayoutManager(this, 1)
        recyclerView.adapter = RestaurantAdapter(this, listOf())

        val list = mutableListOf<ListItem>()

        recyclerView.adapter = RestaurantAdapter(this, list)

        val spinner = findViewById<Spinner>(R.id.spinner)
        // Create an ArrayAdapter using the string array and a default spinner layout
        ArrayAdapter.createFromResource(
            this,
            R.array.planets_array,
            android.R.layout.simple_spinner_item
        ).also { adapter ->
            // Specify the layout to use when the list of choices appears
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            // Apply the adapter to the spinner
            spinner.adapter = adapter
        }
        spinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View, position: Int, id: Long) {
                val selectedItem = parent.getItemAtPosition(position).toString()

                sort = if (selectedItem == "End Hours"){
                    "endHours"
                } else if (selectedItem == "Start Hours") {
                    "startHours"
                } else {
                    "name"
                }

                popUpLayout.visibility = View.GONE
                makeList()

            } // to close the onItemSelected

            override fun onNothingSelected(parent: AdapterView<*>) {

            }
        }
        context = this
        makeList()
    }

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.nav_menu, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        popUpVisibility(true)

        return super.onOptionsItemSelected(item)
    }

    private fun popUpVisibility(bool : Boolean){
        if (bool) {
            popUpLayout.visibility = View.VISIBLE
        }
        else {
            popUpLayout.visibility = View.GONE
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    fun makeList() {
        coroutineScope.launch {
            try {
                val response = HttpApi.retrofitService.getRestaurantsAsync(sort).await()
                Log.i(TAG, "getRestaurantsAsync success: $response")

                // convert response JSONArray to List<RestaurantModel>
                val data = JSONArray(response)
                // loop through data
                val itemList = mutableListOf<RestaurantModel>()
                for (i in 0 until data.length()) {
                    try {
                        val item = data.getJSONObject(i)
                        val location = item.getString("name")
                        var hourStart = item.optString("startHours", "00:00 - ")
                        if (hourStart == "null"){
                            hourStart = "Hours Unknown"
                        }
                        else {
                            hourStart = hourStart.slice(0 until 2) + ":" + hourStart.slice(2 until 4) + " - "
                        }
                        var hourStop = item.optString("endHours", "24:00")
                        if (hourStop == "null"){
                            hourStop = ""
                        }
                        else {
                            hourStop = hourStop.slice(0 until 2) + ":" + hourStop.slice(2 until 4)
                        }
                        val status = isOpen(hourStart, hourStop)
                        val listItem = RestaurantModel(location, hourStart, hourStop, status)
                        itemList.add(listItem)
                    } catch (e: Exception) {
                        Log.e(TAG, "parseRestaurants error: $e")
                    }
                }

                // populate list
                val list = mutableListOf<ListItem>()
                itemList.forEach {
                    val item = ListItem(it.location, it.hourStart, it.hourStop, it.status)
                    list.add(item)
                }

                withContext(Dispatchers.Main) {
                    recyclerView.adapter = RestaurantAdapter(context, list)
                }

            } catch (e: Exception) {
                e.printStackTrace()
                Log.e(TAG, "getRestaurantsAsync fail: ${e.localizedMessage}")

                showError.postValue(true)
            }

            loading.postValue(false)
        }
    }

    class ListItem {
        var name: String = ""
        var hourStart: String = ""
        var hourStop: String = ""
        var status: String = ""

        constructor(location: String, hourStart: String, hourStop: String, status: String) {
            this.name = location
            this.hourStart = hourStart
            this.hourStop = hourStop
            this.status = status
        }
    }

    // Checks to see if the restaurant is currently open
    @RequiresApi(Build.VERSION_CODES.O)
    fun isOpen(openTime: String, closeTime: String) : String{
        if (closeTime == "") {
            return ("Closed")
        }

        val openHour = openTime.slice(0 until 2)
        val openMin = openTime.slice(3 until 5)
        val closeHour = closeTime.slice(0 until 2)
        val closeMin = closeTime.slice(3 until 5)
        val currentTime = LocalTime.now().toString()
        val currentHour = currentTime.slice(0 until 2)
        val currentMin = currentTime.slice(3 until 5)

        if ((currentHour.toInt() > openHour.toInt() && currentHour.toInt() < closeHour.toInt()) ||  // Definitely within the open hours
            (currentHour.toInt() == openHour.toInt() && currentMin.toInt() > openMin.toInt())  ||   // Same time as open hour but later minute
            (currentHour.toInt() == closeHour.toInt() && currentMin.toInt() < closeMin.toInt())) {  // Same time as close hour but earlier minute
                return ("Open")
            }
        return ("Closed")
    }

}