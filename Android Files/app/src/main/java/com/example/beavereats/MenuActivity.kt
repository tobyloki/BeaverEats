package com.example.beavereats

import android.content.Context
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.MenuItem
import android.view.View
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.lifecycle.MutableLiveData
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.*
import org.json.JSONArray
import java.lang.Exception

class MenuActivity : AppCompatActivity() {

    private val loading = MutableLiveData<Boolean>().apply {
        value = false
    }
    private val showError = MutableLiveData<Boolean>().apply {
        value = false
    }

    private var viewModelJob = Job()
    private val coroutineScope = CoroutineScope(viewModelJob + Dispatchers.Main)
    private val TAG = MainActivity::class.java.simpleName
    private lateinit var context : Context

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.menu_activity)
        val recyclerView = findViewById<RecyclerView>(R.id.rvMenuList)

        recyclerView.focusable = View.NOT_FOCUSABLE
        recyclerView.layoutManager = GridLayoutManager(this, 1)
        recyclerView.adapter = RestaurantAdapter(this, listOf())

        val list = mutableListOf<MenuActivity.ListItem>()

        supportActionBar!!.setDisplayHomeAsUpEnabled(true)
        var restaurantName = intent.getStringExtra("Restaurant")
        supportActionBar!!.title = "$restaurantName - Menu"

        context = this
        coroutineScope.launch {
            try {
                val response = HttpApi.retrofitService.getMenuAsync().await()
                Log.i(TAG, "getMenuAsync success: $response")

                // convert response JSONArray to List<MenuModel>
                val data = JSONArray(response)
                // loop through data
                val itemList = mutableListOf<MenuModel>()
                for (i in 0 until data.length()) {
                    try {
                        val item = data.getJSONObject(i)
                        val name = item.getString("title")
                        val listItem = MenuModel(name)
                        itemList.add(listItem)

                    } catch (e: Exception) {
                        Log.e(TAG, "parseMenu error: $e")
                    }
                }

                // populate list
                val list = mutableListOf<MenuActivity.ListItem>()
                itemList.forEach {
                    val item =
                        MenuActivity.ListItem(it.name)
                    list.add(item)
                }

                withContext(Dispatchers.Main) {
                    recyclerView.adapter = MenuAdapter(context, list)
                }

            } catch (e: Exception) {
                e.printStackTrace()
                Log.e(TAG, "getMenuAsync fail: ${e.localizedMessage}")

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