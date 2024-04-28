pub mod game;
pub mod game_file;
pub mod metadata;
pub mod platform;

pub trait FromMessages<T>
where
    Self: Sized + From<T>,
{
    fn from_messages(messages: Vec<T>) -> Vec<Self> {
        messages.into_iter().map(Self::from).collect()
    }
}

pub trait IntoMessages<T>
where
    Self: Into<T>,
{
    fn into_messages(rows: Vec<Self>) -> Vec<T> {
        rows.into_iter().map(Into::into).collect()
    }
}
