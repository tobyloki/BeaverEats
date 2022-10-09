package com.example.beavereats

import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import android.view.MenuItem
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.MutableLiveData
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.*
import org.json.JSONArray
import java.lang.Exception

class FoodActivity : AppCompatActivity() {

    private val loading = MutableLiveData<Boolean>().apply {
        value = false
    }
    private val showError = MutableLiveData<Boolean>().apply {
        value = false
    }

    private var viewModelJob = Job()
    private val coroutineScope = CoroutineScope(viewModelJob + Dispatchers.Main)
    private val TAG = MainActivity::class.java.simpleName

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.food_activity)
        val recyclerView = findViewById<RecyclerView>(R.id.rvFoodList)

        recyclerView.focusable = View.NOT_FOCUSABLE
        recyclerView.layoutManager = GridLayoutManager(this, 1)
        recyclerView.adapter = RestaurantAdapter(this, listOf())

        val list = mutableListOf<FoodActivity.ListItem>()

        recyclerView.adapter = FoodAdapter(list)

        supportActionBar!!.setDisplayHomeAsUpEnabled(true)
        var restaurantName : String = intent.getStringExtra("Restaurant") ?: ""
        var menuName : String = intent.getStringExtra("Title") ?: ""
        supportActionBar!!.title = "$restaurantName - Menu"

        coroutineScope.launch {
            try {
                val response = HttpApi.retrofitService.getFoodAsync(restaurantName, menuName).await()
                Log.i(TAG, "getFoodAsync success: $response")

                // convert response JSONArray to List<FoodModel>
                val data = JSONArray(response)
                // loop through data
                val itemList = mutableListOf<FoodModel>()
                for (i in 0 until data.length()) {
                    try {
                        val item = data.getJSONObject(i)
                        val name = item.getString("name")
                        val listItem = FoodModel(name)
                        itemList.add(listItem)

                    } catch (e: Exception) {
                        Log.e(TAG, "parseFood error: $e")
                    }
                }

                // populate list
                val list = mutableListOf<FoodActivity.ListItem>()
                itemList.forEach {
                    val item =
                        FoodActivity.ListItem(it.name)
                    list.add(item)
                }

                withContext(Dispatchers.Main) {
                    recyclerView.adapter = FoodAdapter(list)
                }

            } catch (e: Exception) {
                e.printStackTrace()
                Log.e(TAG, "getFoodAsync fail: ${e.localizedMessage}")

                showError.postValue(true)
            }

            loading.postValue(false)
        }
    }

    class ListItem {
        var name: String = ""

        constructor(name: String) {
            this.name = name
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.nav_filter -> Toast.makeText(this, "Filter selected", Toast.LENGTH_SHORT).show()
        }

        return super.onOptionsItemSelected(item)
    }




}