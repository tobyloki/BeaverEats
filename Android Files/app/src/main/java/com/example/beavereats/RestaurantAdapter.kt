package com.example.beavereats

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import java.util.*

class RestaurantAdapter (var restaurants: List<MainActivity.ListItem>) :   RecyclerView.Adapter<RestaurantAdapter.ViewHolder>() {
    private val TAG = RestaurantAdapter::class.java.simpleName

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.restaurant_item, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val restaurant = restaurants[position]

        holder.location.text = restaurant.location
        holder.hourStart.text = restaurant.hourStart
        holder.hourStop.text = restaurant.hourStop
        holder.status.text = restaurant.status


        holder.itemView.setOnClickListener {
            Log.i(TAG, "item clicked")
        }
    }

    override fun getItemCount(): Int {
        return restaurants.size
    }

    // create a class for the view holder
    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val location: TextView
        val hourStart: TextView
        val hourStop: TextView
        val status: TextView


        init {
            this.location = itemView.findViewById(R.id.tvRestaurantName)
            this.hourStart = itemView.findViewById(R.id.tvHourStart)
            this.hourStop = itemView.findViewById(R.id.tvHourStop)
            this.status = itemView.findViewById(R.id.tvStatus)
        }
    }
}