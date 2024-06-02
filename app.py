from flask import Flask, render_template, request
import pandas as pd
import plotly.express as px
import plotly
import json

def clear_data(df):
    df_new = pd.DataFrame(columns=df.columns, data=[[None] * len(df.columns) for _ in range(df.shape[0])])
    for i, row in df.iterrows():
        for j, year in enumerate(row[2:]):
            try:
                year_int = int(year)
            except Exception:
                year_int = None
            df_new.iloc[i, j+2] = year_int
    df_new["Names"] = df["Names"]
    df_new["Amount"] = df["Amount"]
    return df_new

df_M_J = pd.read_excel('Names.xlsx', sheet_name='יהודים')
df_F_J = pd.read_excel('Names.xlsx', sheet_name='יהודיות')
df_M_M = pd.read_excel('Names.xlsx', sheet_name='מוסלמים')
df_F_M = pd.read_excel('Names.xlsx', sheet_name='מוסלמיות')
df_M_C = pd.read_excel('Names.xlsx', sheet_name='נוצרים')
df_F_C = pd.read_excel('Names.xlsx', sheet_name='נוצריות')
df_M_J = clear_data(df_M_J)
df_F_J = clear_data(df_F_J)
df_M_M = clear_data(df_M_M)
df_F_M = clear_data(df_F_M)
df_M_C = clear_data(df_M_C)
df_F_C = clear_data(df_F_C)

def create_plot(name, M_status, F_status, religion):
    year_M, amount_M, year_F, amount_F = [], [], [], []
    place_M, place_F = 0, 0
    df_M = df_M_J
    df_F = df_F_J
    messages = []
    if religion == 'Muslims':
        df_M = df_M_M
        df_F = df_F_M
    elif religion == 'Christians':
        df_M = df_M_C
        df_F = df_F_C
    if M_status:
        name_row = df_M[df_M['Names'] == name]
        if name_row.empty:
            messages.append(f"השם '{name}' לא נמצא בשמות הגברים")
        else:
            year_M = name_row.columns[2:]
            amount_M = name_row.iloc[0][2:]
            year_M = year_M[amount_M.notnull()]
            amount_M = amount_M[amount_M.notnull()]
            place_M = (df_M["Amount"] > df_M[df_M["Names"] == name]["Amount"].values[0]).sum() + 1
            messages.append(f"השם '{name}' נפוץ במקום {df_M.shape[0]}/{place_M} בשמות הגברים")

    if F_status:
        name_row = df_F[df_F['Names'] == name]
        if name_row.empty:
            messages.append(f"השם '{name}' לא נמצא בשמות הנשים")
        else:
            year_F = name_row.columns[2:]
            amount_F = name_row.iloc[0][2:]
            year_F = year_F[amount_F.notnull()]
            amount_F = amount_F[amount_F.notnull()]
            place_F = (df_F["Amount"] > df_F[df_F["Names"] == name]["Amount"].values[0]).sum() + 1
            messages.append(f"השם '{name}' נפוץ במקום {df_F.shape[0]}/{place_F} בשמות הנשים")

    fig = px.line()

    if M_status:
        fig.add_scatter(x=year_M, y=amount_M, name='גברים', marker_color='blue')
    if F_status:
        fig.add_scatter(x=year_F, y=amount_F, name='נשים', marker_color='red')
    fig.update_layout(title=f"שמות חדשים עבור {name}", title_x=0.5, height=800, width=950)
    return fig, messages

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        name = request.form['name']
        M_status = 'M_status' in request.form
        F_status = 'F_status' in request.form
        religion = request.form['religion']
        fig, messages = create_plot(name, M_status, F_status, religion)
        graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        return render_template('index.html', graphJSON=graphJSON, messages=messages)
    else:
        return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)