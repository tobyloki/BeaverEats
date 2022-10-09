package com.example.beavereats

import android.content.Context
import android.content.Intent
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class MenuAdapter (var context: Context, var restaurantName: String, var menus: List<MenuActivity.ListItem>) :   RecyclerView.Adapter<MenuAdapter.ViewHolder>() {
    private val TAG = MenuAdapter::class.java.simpleName

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.menu_item, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val menu = menus[position]

        holder.name.text = menu.name


        holder.itemView.setOnClickListener {
            Log.i(TAG, "item clicked")
        }


        holder.itemView.setOnClickListener {
            val intent = Intent(context, FoodActivity::class.java)
            intent.putExtra("Restaurant", restaurantName)
            intent.putExtra("Title", menu.name)
            context.startActivity(intent)
            Log.i(TAG, "Menu clicked")
        }
    }

    override fun getItemCount(): Int {
        return menus.size
    }

    // create a class for the view holder
    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val name: TextView

        init {
            this.name = itemView.findViewById(R.id.tvMenuName)
        }
    }
}