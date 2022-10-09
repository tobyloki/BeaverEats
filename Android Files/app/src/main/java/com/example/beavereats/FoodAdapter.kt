package com.example.beavereats

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class FoodAdapter (var foods: List<FoodActivity.ListItem>) :   RecyclerView.Adapter<MenuAdapter.ViewHolder>() {
    private val TAG = MenuAdapter::class.java.simpleName

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.menu_item, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val food = foods[position]

        holder.name.text = food.name


        holder.itemView.setOnClickListener {
            Log.i(TAG, "item clicked")
        }
    }

    override fun getItemCount(): Int {
        return foods.size
    }

    // create a class for the view holder
    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val name: TextView

        init {
            this.name = itemView.findViewById(R.id.tvFoodName)
        }
    }
}